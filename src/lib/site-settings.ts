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
  | "store_description"
  | "email"
  | "phone"
>;

let missingStoreDescriptionMigrationLogged = false;

export async function getSiteSettings(): Promise<StorefrontSettings | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("public_site_settings")
    .select("whatsapp_admin_number, instagram_url, tiktok_url, facebook_url, google_maps_url, shopee_url, shop_photo_url, address, store_description, email, phone")
    .eq("id", true)
    .maybeSingle();

  if (error && error.message.includes("store_description") && /does not exist|schema cache/i.test(error.message)) {
    if (!missingStoreDescriptionMigrationLogged) {
      missingStoreDescriptionMigrationLogged = true;
      console.error("Store description migration is pending in Supabase.", error);
    }
    const { data: legacyData, error: legacyError } = await supabase
      .from("public_site_settings")
      .select("whatsapp_admin_number, instagram_url, tiktok_url, facebook_url, google_maps_url, shopee_url, shop_photo_url, address, email, phone")
      .eq("id", true)
      .maybeSingle();
    if (legacyError) throw new Error(`Gagal memuat pengaturan situs: ${legacyError.message}`);
    return legacyData ? { ...legacyData, store_description: null } : null;
  }
  if (error) throw new Error(`Gagal memuat pengaturan situs: ${error.message}`);
  return data;
}
