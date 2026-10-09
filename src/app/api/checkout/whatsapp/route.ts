import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/site-settings";
import { formatRupiah, makeWhatsAppUrl } from "@/lib/format";

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_phone: z.string().trim().regex(/^[+0-9()\s-]{8,20}$/),
  customer_email: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
  address: z.string().trim().min(5).max(500),
  district: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().min(2).max(100),
  postal_code: z.string().trim().min(3).max(12),
  notes: z.string().trim().max(1000).optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid().nullable(),
    quantity: z.number().int().min(1).max(99),
    price_type: z.enum(["ECER", "GROSIR"]),
  })).min(1).max(50),
});

type WhatsAppItem = {
  name: string;
  variant: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Format data checkout tidak valid." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Periksa kembali data kontak, alamat, dan produk dalam keranjang." },
      { status: 400 },
    );
  }

  const [supabase, settings] = await Promise.all([
    createSupabaseServerClient(),
    getSiteSettings(),
  ]);
  if (!supabase) {
    return Response.json({ error: "Koneksi Supabase belum dikonfigurasi." }, { status: 503 });
  }
  if (!settings?.whatsapp_admin_number) {
    return Response.json({ error: "Nomor WhatsApp Admin belum diatur." }, { status: 503 });
  }

  const productIds = [...new Set(parsed.data.items.map((item) => item.product_id))];
  const [{ data: products, error: productsError }, { data: variants, error: variantsError }] = await Promise.all([
    supabase.from("products")
      .select("id, name, ecer_price, grosir_price, grosir_min_qty")
      .in("id", productIds)
      .eq("is_active", true),
    supabase.from("product_variants")
      .select("id, product_id, name, color, size, additional_price")
      .in("product_id", productIds)
      .eq("is_active", true),
  ]);
  if (productsError || variantsError) {
    console.error("Checkout could not validate the current catalog.", productsError ?? variantsError);
    return Response.json(
      { error: "Katalog belum dapat diperiksa. Tunggu sebentar, lalu coba kembali." },
      { status: 422 },
    );
  }
  const productsById = new Map((products ?? []).map((product) => [product.id, product]));
  const variantsById = new Map((variants ?? []).map((variant) => [variant.id, variant]));
  const validatedItems: WhatsAppItem[] = [];

  for (const item of parsed.data.items) {
    const product = productsById.get(item.product_id);
    if (!product) {
      return Response.json(
        { error: "Salah satu produk sudah tidak tersedia. Perbarui keranjang sebelum melanjutkan." },
        { status: 422 },
      );
    }

    const variant = item.variant_id ? variantsById.get(item.variant_id) : null;
    if (item.variant_id && (!variant || variant.product_id !== product.id)) {
      return Response.json(
        { error: "Salah satu varian sudah tidak tersedia. Perbarui keranjang sebelum melanjutkan." },
        { status: 422 },
      );
    }
    if (item.price_type === "GROSIR" && (
      product.grosir_price === null || item.quantity < product.grosir_min_qty
    )) {
      return Response.json(
        { error: "Jumlah produk belum memenuhi minimum harga grosir." },
        { status: 422 },
      );
    }

    const basePrice = item.price_type === "GROSIR"
      ? Number(product.grosir_price)
      : Number(product.ecer_price);
    const unitPrice = basePrice + (variant ? Number(variant.additional_price) : 0);
    validatedItems.push({
      name: product.name,
      variant: variant
        ? [variant.name, variant.size, variant.color].filter(Boolean).join(" / ")
        : null,
      quantity: item.quantity,
      unit_price: unitPrice,
      subtotal: unitPrice * item.quantity,
    });
  }

  const subtotal = validatedItems.reduce((total, item) => total + item.subtotal, 0);
  const itemLines = validatedItems.map((item, index) => [
    `${index + 1}. ${item.name}`,
    item.variant ? `   Varian: ${item.variant}` : null,
    `   Qty: ${item.quantity}`,
    `   Harga: ${formatRupiah(item.unit_price)}`,
    `   Subtotal: ${formatRupiah(item.subtotal)}`,
  ].filter(Boolean).join("\n")).join("\n\n");
  const message = [
    "Halo Admin Faminis Barokah, saya ingin menanyakan ketersediaan produk berikut.",
    "",
    `Nama: ${parsed.data.customer_name}`,
    `WhatsApp: ${parsed.data.customer_phone}`,
    "",
    "Produk:",
    itemLines,
    "",
    `Estimasi subtotal produk: ${formatRupiah(subtotal)}`,
    "",
    `Alamat: ${parsed.data.address}, ${parsed.data.district}, ${parsed.data.city}, ${parsed.data.province}, ${parsed.data.postal_code}`,
    parsed.data.customer_email ? `Email: ${parsed.data.customer_email}` : null,
    parsed.data.notes ? `Catatan: ${parsed.data.notes}` : null,
    "",
    "Mohon konfirmasi stok dan total akhir sebelum pembayaran.",
  ].filter(Boolean).join("\n");
  const whatsappUrl = makeWhatsAppUrl(settings.whatsapp_admin_number, message);
  if (!whatsappUrl) {
    console.error("Configured WhatsApp number is invalid.");
    return Response.json({ error: "Nomor WhatsApp Admin belum valid." }, { status: 503 });
  }

  return Response.json({
    whatsappUrl,
  });
}
