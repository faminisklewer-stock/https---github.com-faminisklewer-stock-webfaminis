import { getPublicSupabaseClient } from "@/lib/supabase/config";
import type { Category, Product, ProductImage, ProductVariant } from "@/types/database";

const productSelection =
  "id, category_id, name, slug, sku, ecer_price, grosir_price, grosir_min_qty, stock, stock_status, is_active, is_featured, is_best_seller, seo_title, seo_description, focus_keyword, canonical_url, og_image, created_at, updated_at";

const SAMPLE_DATE = "2026-10-09T00:00:00.000Z";
const SAMPLE_IMAGE = "/images/sample-daster.svg";

const FALLBACK_CATEGORY: Category = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Daster",
  slug: "daster",
  description: "Kategori contoh untuk menampilkan produk sebelum katalog Supabase tersedia.",
  image_url: SAMPLE_IMAGE,
  seo_title: null,
  seo_description: null,
  is_active: true,
  created_at: SAMPLE_DATE,
  updated_at: SAMPLE_DATE,
};

const FALLBACK_PRODUCT: CatalogProduct = {
  id: "22222222-2222-4222-8222-222222222222",
  category_id: FALLBACK_CATEGORY.id,
  name: "Contoh Produk Daster",
  slug: "contoh-produk-daster",
  sku: "CONTOH-DAS-001",
  ecer_price: 65000,
  grosir_price: 55000,
  grosir_min_qty: 12,
  stock: null,
  stock_status: "CONFIRM",
  is_active: true,
  is_featured: false,
  is_best_seller: false,
  seo_title: null,
  seo_description: null,
  focus_keyword: null,
  canonical_url: null,
  og_image: null,
  created_at: SAMPLE_DATE,
  updated_at: SAMPLE_DATE,
  categories: { name: FALLBACK_CATEGORY.name, slug: FALLBACK_CATEGORY.slug },
  product_variants: [],
  isSample: true,
  product_images: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      product_id: "22222222-2222-4222-8222-222222222222",
      image_url: SAMPLE_IMAGE,
      alt_text: "Ilustrasi contoh produk daster",
      sort_order: 0,
      created_at: SAMPLE_DATE,
    },
  ],
};

export type CatalogProduct = Omit<Product, "short_description" | "description"> & {
  categories: Pick<Category, "name" | "slug"> | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  isSample?: boolean;
};

function buildFallbackCategories(): Category[] {
  return [FALLBACK_CATEGORY];
}

function buildFallbackProducts(): CatalogProduct[] {
  return [FALLBACK_PRODUCT];
}

export async function getCategories() {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return buildFallbackCategories();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, seo_title, seo_description, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(`Gagal memuat kategori: ${error.message}`);
  return (data ?? []) as Category[];
}

export async function getProducts(options: {
  categorySlug?: string;
  search?: string;
  sort?: string;
  limit?: number;
  featured?: boolean;
  bestSeller?: boolean;
  featuredForReseller?: boolean;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: Product["stock_status"];
} = {}) {
  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    const sample = buildFallbackProducts().filter((product) => {
      if (options.categorySlug && product.categories?.slug !== options.categorySlug) return false;
      if (options.featured && !product.is_featured) return false;
      if (options.featuredForReseller && !product.is_featured) return false;
      if (options.bestSeller && !product.is_best_seller) return false;
      if (options.minPrice !== undefined && product.ecer_price < options.minPrice) return false;
      if (options.maxPrice !== undefined && product.ecer_price > options.maxPrice) return false;
      if (options.stockStatus && product.stock_status !== options.stockStatus) return false;
      if (options.search) {
        const term = options.search.trim().toLocaleLowerCase("id-ID");
        if (!`${product.name} ${product.sku}`.toLocaleLowerCase("id-ID").includes(term)) return false;
      }
      return true;
    });
    return sample.slice(0, options.limit ?? 8);
  }

  let query = supabase
    .from("products")
    .select(
      `${productSelection}, categories!inner(name, slug), product_images(id, product_id, image_url, alt_text, sort_order, created_at)`,
    )
    .eq("is_active", true);

  if (options.categorySlug) query = query.eq("categories.slug", options.categorySlug);
  if (options.featured) query = query.eq("is_featured", true);
  if (options.featuredForReseller) query = query.eq("is_featured", true);
  if (options.bestSeller) query = query.eq("is_best_seller", true);
  if (options.search) {
    const term = options.search.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
    if (term) query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
  }
  if (options.minPrice !== undefined) query = query.gte("ecer_price", options.minPrice);
  if (options.maxPrice !== undefined) query = query.lte("ecer_price", options.maxPrice);
  if (options.stockStatus) query = query.eq("stock_status", options.stockStatus);

  switch (options.sort) {
    case "harga-termurah":
      query = query.order("ecer_price", { ascending: true });
      break;
    case "harga-tertinggi":
      query = query.order("ecer_price", { ascending: false });
      break;
    case "nama":
      query = query.order("name", { ascending: true });
      break;
    case "terlaris":
      query = query.eq("is_best_seller", true).order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.limit(options.limit ?? 40);
  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat produk: ${error.message}`);

  const result = ((data ?? []) as unknown as CatalogProduct[]).map((product) => ({
    ...product,
    product_variants: product.product_variants ?? [],
    product_images: [...product.product_images].sort((a, b) => a.sort_order - b.sort_order),
  }));

  return result;
}

export async function getProductBySlug(slug: string) {
  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    const fallback = buildFallbackProducts().find((product) => product.slug === slug);
    return fallback ?? null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      `${productSelection}, categories!inner(name, slug), product_images(id, product_id, image_url, alt_text, sort_order, created_at), product_variants(id, product_id, name, color, size, sku, stock, additional_price, image_url, is_active, created_at, updated_at)`,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat detail produk: ${error.message}`);
  if (!data) return null;

  const product = data as unknown as CatalogProduct & {
    product_variants: ProductVariant[];
  };
  return {
    ...product,
    product_images: [...product.product_images].sort((a, b) => a.sort_order - b.sort_order),
    product_variants: (product.product_variants ?? []).filter((variant) => variant.is_active),
  };
}

export async function getCategoryBySlug(slug: string) {
  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    return buildFallbackCategories().find((category) => category.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, seo_title, seo_description, is_active, created_at, updated_at")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat kategori: ${error.message}`);
  return data as Category | null;
}

export async function getAllActiveSlugs() {
  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    return {
      categories: buildFallbackCategories(),
      products: buildFallbackProducts(),
    };
  }

  const [categories, products] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, description, image_url, seo_title, seo_description, is_active, created_at, updated_at")
      .eq("is_active", true),
    supabase
      .from("products")
      .select(productSelection)
      .eq("is_active", true),
  ]);

  if (categories.error) {
    throw new Error(`Gagal memuat kategori sitemap: ${categories.error.message}`);
  }
  if (products.error) {
    throw new Error(`Gagal memuat produk sitemap: ${products.error.message}`);
  }

  return {
    categories: (categories.data ?? []) as Category[],
    products: (products.data ?? []) as Product[],
  };
}
