import { getPublicSupabaseClient } from "@/lib/supabase/config";
import type { PublicSiteSettings } from "@/types/database";

export async function getSiteSettings(): Promise<PublicSiteSettings | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("public_site_settings")
    .select(
      "id, site_name, logo_url, favicon_url, whatsapp_admin_number, reseller_whatsapp_group_url, instagram_url, tiktok_url, facebook_url, google_maps_url, shopee_url, shop_photo_url, promo_tiktok_url, promo_tiktok_image_url, promo_reseller_image_url, address, email, phone, member_program_enabled, member_discount_enabled, member_program_description, reseller_program_description, default_seo_title, default_meta_description, created_at, updated_at",
    )
    .eq("id", true)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat pengaturan situs: ${error.message}`);
  return data;
}
