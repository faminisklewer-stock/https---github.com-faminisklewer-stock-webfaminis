"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const productSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().regex(slugPattern),
  sku: z.string().trim().min(2).max(80),
  category_id: z.string().uuid(),
  short_description: z.string().trim().max(300).optional(),
  description: z.string().trim().max(10000).optional(),
  ecer_price: z.coerce.number().min(0),
  grosir_price: z.union([z.number().min(0), z.null()]),
  grosir_min_qty: z.coerce.number().int().min(1).max(99),
  image_url: z.union([z.string().url().max(2048), z.literal("")]).optional(),
  image_alt: z.string().trim().max(250).optional(),
  stock_status: z.enum(["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK", "CONFIRM"]),
  seo_title: z.string().trim().max(180).optional(),
  seo_description: z.string().trim().max(320).optional(),
  focus_keyword: z.string().trim().max(100).optional(),
  canonical_url: z.union([z.string().url().max(2048), z.literal("")]).optional(),
  og_image: z.union([z.string().url().max(2048), z.literal("")]).optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_best_seller: z.boolean(),
});

function readProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    category_id: formData.get("category_id"),
    short_description: formData.get("short_description") || "",
    description: formData.get("description") || "",
    ecer_price: formData.get("ecer_price"),
    grosir_price: formData.get("grosir_price")?.toString().trim()
      ? Number(formData.get("grosir_price"))
      : null,
    grosir_min_qty: formData.get("grosir_min_qty"),
    image_url: formData.get("image_url") || "",
    image_alt: formData.get("image_alt") || "",
    stock_status: formData.get("stock_status") || "CONFIRM",
    seo_title: formData.get("seo_title") || "",
    seo_description: formData.get("seo_description") || "",
    focus_keyword: formData.get("focus_keyword") || "",
    canonical_url: formData.get("canonical_url") || "",
    og_image: formData.get("og_image") || "",
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    is_best_seller: formData.get("is_best_seller") === "on",
  });
}

export async function createProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = readProductForm(formData);
  if (!parsed.success) redirect("/admin/products?error=invalid");
  const values = parsed.data;
  const { data: product, error } = await supabase.from("products").insert({
    name: values.name,
    slug: values.slug,
    sku: values.sku,
    category_id: values.category_id,
    short_description: values.short_description || null,
    description: values.description || null,
    ecer_price: values.ecer_price,
    grosir_price: values.grosir_price,
    grosir_min_qty: values.grosir_min_qty,
    stock_status: values.stock_status,
    is_active: values.is_active,
    is_featured: values.is_featured,
    is_best_seller: values.is_best_seller,
    seo_title: values.seo_title || null,
    seo_description: values.seo_description || null,
    focus_keyword: values.focus_keyword || null,
    canonical_url: values.canonical_url || null,
    og_image: values.og_image || null,
  }).select("id").single();

  if (error) {
    console.error("Admin could not create product.", error);
    redirect("/admin/products?error=save");
  }
  if (values.image_url && product) {
    const { error: imageError } = await supabase.from("product_images").insert({
      product_id: product.id,
      image_url: values.image_url,
      alt_text: values.image_alt || values.name,
      sort_order: 0,
    });
    if (imageError) {
      console.error("Product was created but its image could not be saved.", imageError);
      redirect("/admin/products?error=image");
    }
  }
  revalidatePath("/");
  revalidatePath("/produk");
  redirect("/admin/products?success=created");
}

export async function updateProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = readProductForm(formData);
  if (!id.success || !parsed.success) redirect("/admin/products?error=invalid");
  const values = parsed.data;
  const { error } = await supabase.from("products").update({
    name: values.name,
    slug: values.slug,
    sku: values.sku,
    category_id: values.category_id,
    short_description: values.short_description || null,
    description: values.description || null,
    ecer_price: values.ecer_price,
    grosir_price: values.grosir_price,
    grosir_min_qty: values.grosir_min_qty,
    stock_status: values.stock_status,
    is_active: values.is_active,
    is_featured: values.is_featured,
    is_best_seller: values.is_best_seller,
    seo_title: values.seo_title || null,
    seo_description: values.seo_description || null,
    focus_keyword: values.focus_keyword || null,
    canonical_url: values.canonical_url || null,
    og_image: values.og_image || null,
  }).eq("id", id.data);

  if (error) {
    console.error("Admin could not update product.", error);
    redirect(`/admin/products/${id.data}?error=save`);
  }
  const { data: existingImages, error: imageReadError } = await supabase
    .from("product_images").select("id, image_url, sort_order").eq("product_id", id.data).order("sort_order");
  if (imageReadError) {
    console.error("Updated product image could not be checked.", imageReadError);
    redirect(`/admin/products/${id.data}?error=image`);
  }
  if (values.image_url && existingImages?.[0]?.image_url !== values.image_url) {
    const primaryImage = existingImages?.[0];
    const { error: imageError } = primaryImage
      ? await supabase.from("product_images").update({
          image_url: values.image_url,
          alt_text: values.image_alt || values.name,
        }).eq("id", primaryImage.id)
      : await supabase.from("product_images").insert({
          product_id: id.data,
          image_url: values.image_url,
          alt_text: values.image_alt || values.name,
          sort_order: 0,
        });
    if (imageError) {
      console.error("Updated product photo could not be saved.", imageError);
      redirect(`/admin/products/${id.data}?error=image`);
    }
  }
  revalidatePath("/");
  revalidatePath("/produk");
  revalidatePath(`/produk/${values.slug}`);
  redirect("/admin/products?success=updated");
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/products?error=invalid");
  const { error } = await supabase.from("products").delete().eq("id", id.data);
  if (error) {
    console.error("Admin could not delete product.", error);
    redirect("/admin/products?error=delete");
  }
  revalidatePath("/");
  revalidatePath("/produk");
  redirect("/admin/products?success=deleted");
}

export async function setProductStock(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const status = z.enum(["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK", "CONFIRM"]).safeParse(formData.get("status"));
  if (!id.success || !status.success) redirect("/admin/products?error=invalid");
  const { error } = await supabase.from("products").update({ stock_status: status.data }).eq("id", id.data);
  if (error) {
    console.error("Admin could not update product stock status.", error);
    redirect("/admin/products?error=save");
  }
  revalidatePath("/");
  revalidatePath("/produk");
  redirect("/admin/products?success=updated");
}

const variantSchema = z.object({
  id: z.union([z.string().uuid(), z.literal("")]),
  product_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  color: z.string().trim().max(80),
  size: z.string().trim().max(80),
  sku: z.string().trim().min(2).max(80),
  stock: z.preprocess(
    (value) => value === "" ? null : value,
    z.union([z.coerce.number().int().min(0).max(999999), z.null()]),
  ),
  additional_price: z.coerce.number().min(0).max(100_000_000),
  image_url: z.union([z.string().url().max(2048), z.literal("")]),
  is_active: z.boolean(),
});

export async function saveProductVariant(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = variantSchema.safeParse({
    id: formData.get("id") || "",
    product_id: formData.get("product_id"),
    name: formData.get("name"),
    color: formData.get("color") || "",
    size: formData.get("size") || "",
    sku: formData.get("sku"),
    stock: formData.get("stock")?.toString().trim() || "",
    additional_price: formData.get("additional_price"),
    image_url: formData.get("image_url") || "",
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) redirect("/admin/products?error=invalid");

  const { id, product_id, ...values } = parsed.data;
  const payload = {
    ...values,
    color: values.color || null,
    size: values.size || null,
    stock: values.stock,
    image_url: values.image_url || null,
  };
  const result = id
    ? await supabase.from("product_variants").update(payload).eq("id", id).eq("product_id", product_id)
    : await supabase.from("product_variants").insert({ ...payload, product_id });
  if (result.error) {
    console.error("Admin could not save product variant.", result.error);
    redirect(`/admin/products/${product_id}?error=variant`);
  }
  revalidatePath("/");
  revalidatePath("/produk");
  redirect(`/admin/products/${product_id}?success=variant`);
}

export async function deleteProductVariant(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const productId = z.string().uuid().safeParse(formData.get("product_id"));
  if (!id.success || !productId.success) redirect("/admin/products?error=invalid");
  const { error } = await supabase.from("product_variants").delete()
    .eq("id", id.data).eq("product_id", productId.data);
  if (error) {
    console.error("Admin could not delete product variant.", error);
    redirect(`/admin/products/${productId.data}?error=variant`);
  }
  revalidatePath("/");
  revalidatePath("/produk");
  redirect(`/admin/products/${productId.data}?success=variant`);
}

const categorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(slugPattern),
  description: z.string().trim().max(1000).optional(),
  image_url: z.union([z.string().url().max(2048), z.literal("")]).optional(),
  seo_title: z.string().trim().max(180).optional(),
  seo_description: z.string().trim().max(320).optional(),
  is_active: z.boolean(),
});

export async function createCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || "",
    image_url: formData.get("image_url") || "",
    seo_title: formData.get("seo_title") || "",
    seo_description: formData.get("seo_description") || "",
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) redirect("/admin/categories?error=invalid");
  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
    image_url: parsed.data.image_url || null,
    seo_title: parsed.data.seo_title || null,
    seo_description: parsed.data.seo_description || null,
    is_active: parsed.data.is_active,
  });
  if (error) {
    console.error("Admin could not create category.", error);
    redirect("/admin/categories?error=save");
  }
  revalidatePath("/");
  redirect("/admin/categories?success=created");
}

export async function updateCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || "",
    image_url: formData.get("image_url") || "",
    seo_title: formData.get("seo_title") || "",
    seo_description: formData.get("seo_description") || "",
    is_active: formData.get("is_active") === "on",
  });
  if (!id.success || !parsed.success) redirect("/admin/categories?error=invalid");
  const { error } = await supabase.from("categories").update(parsed.data).eq("id", id.data);
  if (error) {
    console.error("Admin could not update category.", error);
    redirect(`/admin/categories?error=save`);
  }
  revalidatePath("/");
  redirect("/admin/categories?success=updated");
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/categories?error=invalid");
  const { error } = await supabase.from("categories").delete().eq("id", id.data);
  if (error) {
    console.error("Admin could not delete category.", error);
    redirect("/admin/categories?error=delete");
  }
  revalidatePath("/");
  redirect("/admin/categories?success=deleted");
}

const orderStatuses = [
  "DRAFT", "WAITING_STOCK_CONFIRMATION", "STOCK_CONFIRMED",
  "WAITING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED",
] as const;
const transitions: Record<(typeof orderStatuses)[number], (typeof orderStatuses)[number][]> = {
  DRAFT: ["WAITING_STOCK_CONFIRMATION", "CANCELLED"],
  WAITING_STOCK_CONFIRMATION: ["STOCK_CONFIRMED", "CANCELLED"],
  STOCK_CONFIRMED: ["WAITING_PAYMENT", "CANCELLED"],
  WAITING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateOrderStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const target = z.enum(orderStatuses).safeParse(formData.get("status"));
  if (!id.success || !target.success) redirect("/admin/orders?error=invalid");
  const { data: order, error: readError } = await supabase
    .from("orders").select("status").eq("id", id.data).maybeSingle();
  if (readError) {
    console.error("Admin could not read order status.", readError);
    redirect("/admin/orders?error=save");
  }
  if (!order || !transitions[order.status].includes(target.data)) {
    redirect("/admin/orders?error=transition");
  }
  const { error } = await supabase.from("orders").update({ status: target.data }).eq("id", id.data);
  if (error) {
    console.error("Admin could not update order status.", error);
    redirect("/admin/orders?error=save");
  }
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  redirect("/admin/orders?success=updated");
}

export async function updateMember(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const memberStatus = z.enum(["ACTIVE", "INACTIVE"]).safeParse(formData.get("member_status"));
  const customerType = z.enum(["ECER", "RESELLER", "GROSIR"]).safeParse(formData.get("customer_type"));
  const resellerStatus = z.enum(["NONE", "PENDING", "APPROVED"]).safeParse(formData.get("reseller_status"));
  if (!id.success || !memberStatus.success || !customerType.success || !resellerStatus.success) {
    redirect("/admin/members?error=invalid");
  }
  const { error } = await supabase.from("profiles").update({
    member_status: memberStatus.data,
    customer_type: customerType.data,
    reseller_status: resellerStatus.data,
    member_discount_enabled: formData.get("member_discount_enabled") === "on",
  }).eq("id", id.data);
  if (error) {
    console.error("Admin could not update member.", error);
    redirect("/admin/members?error=save");
  }
  revalidatePath("/admin/members");
  redirect("/admin/members?success=updated");
}

const discountSchema = z.object({
  name: z.string().trim().min(2).max(160),
  discount_type: z.enum(["PERCENTAGE", "NOMINAL"]),
  discount_value: z.coerce.number().positive().max(100_000_000),
  minimum_purchase: z.coerce.number().min(0),
  product_id: z.union([z.string().uuid(), z.literal("")]),
  category_id: z.union([z.string().uuid(), z.literal("")]),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  is_active: z.boolean(),
}).refine((value) => !(value.product_id && value.category_id), {
  message: "Pilih produk atau kategori saja, tidak keduanya.",
}).refine((value) => value.discount_type !== "PERCENTAGE" || value.discount_value <= 100, {
  message: "Diskon persentase maksimal 100%.",
});

export async function createMemberDiscount(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = discountSchema.safeParse({
    name: formData.get("name"),
    discount_type: formData.get("discount_type"),
    discount_value: formData.get("discount_value"),
    minimum_purchase: formData.get("minimum_purchase"),
    product_id: formData.get("product_id") || "",
    category_id: formData.get("category_id") || "",
    start_at: formData.get("start_at") || "",
    end_at: formData.get("end_at") || "",
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) redirect("/admin/member-discounts?error=invalid");
  const { error } = await supabase.from("member_discounts").insert({
    name: parsed.data.name,
    discount_type: parsed.data.discount_type,
    discount_value: parsed.data.discount_value,
    minimum_purchase: parsed.data.minimum_purchase,
    product_id: parsed.data.product_id || null,
    category_id: parsed.data.category_id || null,
    start_at: parsed.data.start_at || null,
    end_at: parsed.data.end_at || null,
    is_active: parsed.data.is_active,
  });
  if (error) {
    console.error("Admin could not create member discount.", error);
    redirect("/admin/member-discounts?error=save");
  }
  revalidatePath("/admin/member-discounts");
  redirect("/admin/member-discounts?success=created");
}

export async function toggleMemberDiscount(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const active = z.enum(["true", "false"]).safeParse(formData.get("active"));
  if (!id.success || !active.success) redirect("/admin/member-discounts?error=invalid");
  const { error } = await supabase.from("member_discounts").update({ is_active: active.data === "true" }).eq("id", id.data);
  if (error) {
    console.error("Admin could not toggle member discount.", error);
    redirect("/admin/member-discounts?error=save");
  }
  revalidatePath("/admin/member-discounts");
  redirect("/admin/member-discounts?success=updated");
}

export async function deleteMemberDiscount(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/member-discounts?error=invalid");
  const { error } = await supabase.from("member_discounts").delete().eq("id", id.data);
  if (error) {
    console.error("Admin could not delete member discount.", error);
    redirect("/admin/member-discounts?error=delete");
  }
  revalidatePath("/admin/member-discounts");
  redirect("/admin/member-discounts?success=deleted");
}

export async function updateSiteSettings(formData: FormData) {
  const { supabase } = await requireAdmin();
  const httpsUrl = z.union([z.string().url().max(2048).refine((value) => value.startsWith("https://")), z.literal("")]);
  const settingsSchema = z.object({
    whatsapp_admin_number: z.string().trim().regex(/^[+0-9\s()-]{10,22}$/).refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }),
    reseller_whatsapp_group_url: httpsUrl,
    address: z.string().trim().max(500),
    email: z.union([z.string().trim().email().max(254), z.literal("")]),
    phone: z.string().trim().max(22),
    instagram_url: httpsUrl,
    tiktok_url: httpsUrl,
    facebook_url: httpsUrl,
    google_maps_url: httpsUrl,
    shopee_url: httpsUrl,
    shop_photo_url: httpsUrl,
    promo_tiktok_url: httpsUrl,
    promo_tiktok_image_url: httpsUrl,
    promo_reseller_image_url: httpsUrl,
  });
  const parsed = settingsSchema.safeParse({
    whatsapp_admin_number: formData.get("whatsapp_admin_number"),
    reseller_whatsapp_group_url: formData.get("reseller_whatsapp_group_url") || "",
    address: formData.get("address") || "",
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    instagram_url: formData.get("instagram_url") || "",
    tiktok_url: formData.get("tiktok_url") || "",
    facebook_url: formData.get("facebook_url") || "",
    google_maps_url: formData.get("google_maps_url") || "",
    shopee_url: formData.get("shopee_url") || "",
    shop_photo_url: formData.get("shop_photo_url") || "",
    promo_tiktok_url: formData.get("promo_tiktok_url") || "",
    promo_tiktok_image_url: formData.get("promo_tiktok_image_url") || "",
    promo_reseller_image_url: formData.get("promo_reseller_image_url") || "",
  });
  if (!parsed.success) redirect("/admin/settings?error=invalid");
  const { error } = await supabase.from("site_settings").update({
    whatsapp_admin_number: parsed.data.whatsapp_admin_number,
    reseller_whatsapp_group_url: parsed.data.reseller_whatsapp_group_url || null,
    address: parsed.data.address || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    instagram_url: parsed.data.instagram_url || null,
    tiktok_url: parsed.data.tiktok_url || null,
    facebook_url: parsed.data.facebook_url || null,
    google_maps_url: parsed.data.google_maps_url || null,
    shopee_url: parsed.data.shopee_url || null,
    shop_photo_url: parsed.data.shop_photo_url || null,
    promo_tiktok_url: parsed.data.promo_tiktok_url || null,
    promo_tiktok_image_url: parsed.data.promo_tiktok_image_url || null,
    promo_reseller_image_url: parsed.data.promo_reseller_image_url || null,
  }).eq("id", true);
  if (error) {
    console.error("Admin could not update site settings.", error);
    redirect("/admin/settings?error=save");
  }
  revalidatePath("/", "layout");
  redirect("/admin/settings?success=updated");
}
