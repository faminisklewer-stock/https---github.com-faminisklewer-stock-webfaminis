alter table public.site_settings
  add column if not exists store_description text;

create or replace view public.public_site_settings
with (security_invoker = true)
as
select
  id, site_name, logo_url, favicon_url, whatsapp_admin_number,
  instagram_url, tiktok_url, facebook_url, address, email, phone,
  member_program_enabled, member_discount_enabled,
  member_program_description, reseller_program_description, default_seo_title,
  default_meta_description, created_at, updated_at, reseller_whatsapp_group_url,
  google_maps_url, shopee_url, shop_photo_url, promo_tiktok_url,
  promo_tiktok_image_url, promo_reseller_image_url, store_description
from public.site_settings
where id = true;

grant select (
  id, site_name, logo_url, favicon_url, whatsapp_admin_number,
  instagram_url, tiktok_url, facebook_url, address, email, phone,
  member_program_enabled, member_discount_enabled,
  member_program_description, reseller_program_description, default_seo_title,
  default_meta_description, created_at, updated_at, reseller_whatsapp_group_url,
  google_maps_url, shopee_url, shop_photo_url, promo_tiktok_url,
  promo_tiktok_image_url, promo_reseller_image_url, store_description
) on public.site_settings to anon, authenticated;

grant update (store_description) on public.site_settings to authenticated;

grant select on public.public_site_settings to anon, authenticated;
