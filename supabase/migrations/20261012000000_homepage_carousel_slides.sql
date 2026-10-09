create table if not exists public.home_carousel_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  image_url text not null check (image_url ~ '^https://'),
  destination_url text not null check (destination_url ~ '^https://'),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.home_carousel_slides enable row level security;

drop policy if exists "Public can view active homepage carousel slides" on public.home_carousel_slides;
drop policy if exists "Admins manage homepage carousel slides" on public.home_carousel_slides;

create policy "Public can view active homepage carousel slides"
  on public.home_carousel_slides for select to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "Admins manage homepage carousel slides"
  on public.home_carousel_slides for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.home_carousel_slides to anon, authenticated;
grant insert, update, delete on public.home_carousel_slides to authenticated;

drop trigger if exists set_updated_at on public.home_carousel_slides;
create trigger set_updated_at before update on public.home_carousel_slides
  for each row execute procedure public.set_updated_at();

create index if not exists home_carousel_slides_active_sort_idx
  on public.home_carousel_slides (sort_order, created_at desc)
  where is_active = true;
