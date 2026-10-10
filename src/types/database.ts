export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<
  Row,
  Insert = Partial<Row>,
  Update = Partial<Row>,
  Relationships extends Relationship[] = [],
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  ecer_price: number;
  grosir_price: number | null;
  grosir_min_qty: number;
  stock: number | null;
  stock_status: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" | "CONFIRM";
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  color: string | null;
  size: string | null;
  sku: string;
  stock: number | null;
  additional_price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
};

export type SiteSettings = {
  id: boolean;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  whatsapp_admin_number: string | null;
  reseller_whatsapp_group_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  google_maps_url: string | null;
  shopee_url: string | null;
  shop_photo_url: string | null;
  store_description: string | null;
  promo_tiktok_url: string | null;
  promo_tiktok_image_url: string | null;
  promo_reseller_image_url: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  member_program_enabled: boolean;
  member_discount_enabled: boolean;
  member_program_description: string | null;
  reseller_program_description: string | null;
  default_seo_title: string | null;
  default_meta_description: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicSiteSettings = SiteSettings;

type Profile = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  customer_type: "ECER" | "RESELLER" | "GROSIR";
  member_status: "ACTIVE" | "INACTIVE";
  member_discount_enabled: boolean;
  reseller_status: "NONE" | "PENDING" | "APPROVED";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type MemberDiscount = {
  id: string;
  name: string;
  discount_type: "PERCENTAGE" | "NOMINAL";
  discount_value: number;
  minimum_purchase: number;
  category_id: string | null;
  product_id: string | null;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Cart = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type CartItemRecord = {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price_type: "ECER" | "GROSIR";
  created_at: string;
};

type Favorite = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

type Promotion = {
  id: string;
  name: string;
  description: string | null;
  discount_type: "PERCENTAGE" | "NOMINAL";
  discount_value: number;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  start_at: string | null;
  end_at: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PromoCard = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  destination_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  content: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HomeCarouselSlide = {
  id: string;
  title: string;
  image_url: string;
  destination_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type SeoPage = {
  id: string;
  page_path: string;
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      categories: Table<Category>;
      products: Table<
        Product,
        Partial<Product>,
        Partial<Product>,
        [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "product_images";
            referencedColumns: ["product_id"];
          },
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["product_id"];
          },
        ]
      >;
      product_variants: Table<ProductVariant>;
      product_images: Table<ProductImage>;
      profiles: Table<Profile>;
      member_discounts: Table<MemberDiscount>;
      site_settings: Table<SiteSettings>;
      carts: Table<Cart>;
      cart_items: Table<CartItemRecord>;
      favorites: Table<Favorite>;
      promotions: Table<Promotion>;
      banners: Table<Banner>;
      promo_cards: Table<PromoCard>;
      home_carousel_slides: Table<HomeCarouselSlide>;
      testimonials: Table<Testimonial>;
      seo_pages: Table<SeoPage>;
    };
    Views: {
      public_site_settings: {
        Row: PublicSiteSettings;
        Relationships: [];
      };
    };
    Functions: {
      get_reseller_group_url: { Args: Record<string, never>; Returns: string };
      get_admin_reseller_group_url: { Args: Record<string, never>; Returns: string | null };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
