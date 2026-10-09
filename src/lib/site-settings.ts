import { getPublicSupabaseClient } from "@/lib/supabase/config";
import type { PublicSiteSettings } from "@/types/database";

type StorefrontSettings = Pick<
  PublicSiteSettings,
  | "whatsapp_admin_number"
  | "instagram_url"
  | "tiktok_url"
  | "facebook_url"
  | "google_maps_url"
  | "shopee_url"
  | "shop_photo_url"
  | "address"
  | "email"
>;

export async function getSiteSettings(): Promise<StorefrontSettings | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("public_site_settings")
    .select("whatsapp_admin_number, instagram_url, tiktok_url, facebook_url, google_maps_url, shopee_url, shop_photo_url, address, email")
    .eq("id", true)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat pengaturan situs: ${error.message}`);
  return data;
}
