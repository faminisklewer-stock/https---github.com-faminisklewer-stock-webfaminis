create table if not exists public.promo_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  description text,
  image_url text,
  destination_url text not null check (destination_url ~ '^https://'),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.promo_cards enable row level security;

drop policy if exists "Public can view active promo cards" on public.promo_cards;
drop policy if exists "Admins manage promo cards" on public.promo_cards;

create policy "Public can view active promo cards"
  on public.promo_cards for select to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "Admins manage promo cards"
  on public.promo_cards for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.promo_cards to anon, authenticated;
grant insert, update, delete on public.promo_cards to authenticated;

drop trigger if exists set_updated_at on public.promo_cards;
create trigger set_updated_at before update on public.promo_cards
  for each row execute procedure public.set_updated_at();

insert into public.promo_cards (
  id, title, description, image_url, destination_url, sort_order, is_active
)
select
  '11000000-0000-4000-8000-000000000001'::uuid,
  'Promo TikTok Live',
  'Kunjungi TikTok Live Faminis untuk melihat informasi promo yang sedang berlangsung.',
  case when promo_tiktok_image_url ~ '^https://' then promo_tiktok_image_url else null end,
  promo_tiktok_url,
  0,
  true
from public.site_settings
where id = true and promo_tiktok_url ~ '^https://'
on conflict (id) do nothing;

insert into public.promo_cards (
  id, title, description, destination_url, sort_order, is_active
)
select
  '11000000-0000-4000-8000-000000000002'::uuid,
  'Grup Reseller Faminis',
  'Gabung ke grup WhatsApp reseller untuk mengikuti kabar dan informasi dari Faminis.',
  reseller_whatsapp_group_url,
  1,
  true
from public.site_settings
where id = true and reseller_whatsapp_group_url ~ '^https://'
on conflict (id) do nothing;

-- WhatsApp checkout no longer stores order requests, so remove the old data and RPC.
drop function if exists public.create_order_request(text, text, text, text, text, text, text, text, text, jsonb);
drop table if exists public.order_items;
drop table if exists public.orders;
drop sequence if exists public.order_number_seq;
