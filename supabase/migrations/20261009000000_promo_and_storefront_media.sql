alter table public.site_settings
  add column if not exists google_maps_url text,
  add column if not exists shopee_url text,
  add column if not exists shop_photo_url text,
  add column if not exists promo_tiktok_url text,
  add column if not exists promo_tiktok_image_url text,
  add column if not exists promo_reseller_image_url text;

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
  promo_tiktok_image_url, promo_reseller_image_url
from public.site_settings
where id = true;

grant select (
  id, site_name, logo_url, favicon_url, whatsapp_admin_number,
  instagram_url, tiktok_url, facebook_url, address, email, phone,
  member_program_enabled, member_discount_enabled,
  member_program_description, reseller_program_description, default_seo_title,
  default_meta_description, created_at, updated_at, reseller_whatsapp_group_url,
  google_maps_url, shopee_url, shop_photo_url, promo_tiktok_url,
  promo_tiktok_image_url, promo_reseller_image_url
) on public.site_settings to anon, authenticated;

grant update (
  reseller_whatsapp_group_url, google_maps_url, shopee_url, shop_photo_url,
  promo_tiktok_url, promo_tiktok_image_url, promo_reseller_image_url
) on public.site_settings to authenticated;

update storage.buckets
set file_size_limit = 5242880
where id = 'site-assets';
