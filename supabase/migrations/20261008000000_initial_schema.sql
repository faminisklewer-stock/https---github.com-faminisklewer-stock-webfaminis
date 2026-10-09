create sequence if not exists public.order_number_seq start with 1;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  email text not null default '',
  role text not null default 'CUSTOMER' check (role in ('CUSTOMER', 'ADMIN')),
  customer_type text not null default 'ECER' check (customer_type in ('ECER', 'RESELLER', 'GROSIR')),
  member_status text not null default 'ACTIVE' check (member_status in ('ACTIVE', 'INACTIVE')),
  member_discount_enabled boolean not null default false,
  reseller_status text not null default 'NONE' check (reseller_status in ('NONE', 'PENDING', 'APPROVED')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  image_url text,
  seo_title text,
  seo_description text,
  focus_keyword text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sku text not null unique,
  short_description text,
  description text,
  ecer_price numeric(14, 2) not null check (ecer_price >= 0),
  grosir_price numeric(14, 2) check (grosir_price is null or grosir_price >= 0),
  grosir_min_qty integer not null default 1 check (grosir_min_qty between 1 and 99),
  stock integer check (stock is null or stock >= 0),
  stock_status text not null default 'CONFIRM'
    check (stock_status in ('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'CONFIRM')),
  is_active boolean not null default false,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  seo_title text,
  seo_description text,
  focus_keyword text,
  canonical_url text,
  og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  color text,
  size text,
  sku text not null unique,
  stock integer check (stock is null or stock >= 0),
  additional_price numeric(14, 2) not null default 0 check (additional_price >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null check (quantity between 1 and 99),
  price_type text not null default 'ECER' check (price_type in ('ECER', 'GROSIR')),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text not null,
  district text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  notes text,
  subtotal numeric(14, 2) not null default 0 check (subtotal >= 0),
  discount numeric(14, 2) not null default 0 check (discount >= 0),
  shipping_cost numeric(14, 2) not null default 0 check (shipping_cost >= 0),
  grand_total numeric(14, 2) not null default 0 check (grand_total >= 0),
  status text not null default 'WAITING_STOCK_CONFIRMATION'
    check (status in (
      'DRAFT', 'WAITING_STOCK_CONFIRMATION', 'STOCK_CONFIRMED',
      'WAITING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED',
      'COMPLETED', 'CANCELLED'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name_snapshot text not null,
  variant_snapshot text,
  price_type text not null check (price_type in ('ECER', 'GROSIR', 'MEMBER')),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 99),
  subtotal numeric(14, 2) not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  discount_type text not null check (discount_type in ('PERCENTAGE', 'NOMINAL')),
  discount_value numeric(14, 2) not null check (discount_value > 0),
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  desktop_image_url text,
  mobile_image_url text,
  cta_label text,
  cta_url text,
  start_at timestamptz,
  end_at timestamptz,
  sort_order integer not null default 0,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  discount_type text not null check (discount_type in ('PERCENTAGE', 'NOMINAL')),
  discount_value numeric(14, 2) not null check (discount_value > 0),
  minimum_purchase numeric(14, 2) not null default 0 check (minimum_purchase >= 0),
  category_id uuid references public.categories(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (category_id is null or product_id is null),
  check (end_at is null or start_at is null or end_at > start_at),
  check (discount_type <> 'PERCENTAGE' or discount_value <= 100)
);

create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  page_path text not null unique,
  seo_title text,
  meta_description text,
  focus_keyword text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  site_name text not null default 'Faminis Barokah',
  logo_url text,
  favicon_url text,
  whatsapp_admin_number text,
  reseller_whatsapp_group_url text,
  instagram_url text,
  tiktok_url text,
  facebook_url text,
  address text,
  email text,
  phone text,
  member_program_enabled boolean not null default true,
  member_discount_enabled boolean not null default false,
  member_program_description text,
  reseller_program_description text,
  default_seo_title text,
  default_meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.categories (name, slug, description)
values
  ('Daster', 'daster', 'Koleksi daster untuk kebutuhan rumah dan harian. Pilih produk ecer atau tanyakan pilihan grosir, motif, dan ukuran yang tersedia kepada Admin.'),
  ('Mukena', 'mukena', 'Lihat koleksi mukena Faminis Barokah. Bahan, motif, warna, dan ketersediaan setiap produk dapat dikonfirmasi kepada Admin.'),
  ('Gamis', 'gamis', 'Temukan gamis untuk pilihan busana muslim harian maupun acara. Periksa informasi ukuran dan bahan pada tiap produk.'),
  ('Sarung', 'sarung', 'Jelajahi koleksi sarung untuk kebutuhan pribadi dan keluarga. Tanyakan motif dan stok terbaru sebelum memesan.'),
  ('Setelan', 'setelan', 'Lihat pilihan setelan fashion muslim. Ukuran, bahan, dan harga grosir mengikuti informasi pada setiap produk.'),
  ('Kaftan', 'kaftan', 'Jelajahi pilihan kaftan Faminis Barokah. Hubungi Admin untuk memastikan warna, motif, dan ketersediaan.'),
  ('Sajadah', 'sajadah', 'Temukan sajadah untuk kebutuhan ibadah. Detail bahan dan stok produk dapat ditanyakan kepada Admin.'),
  ('Baju Koko', 'baju-koko', 'Lihat koleksi baju koko untuk berbagai kebutuhan. Pilihan ukuran dan ketersediaan mengikuti katalog terbaru.')
on conflict (slug) do nothing;

insert into public.site_settings (id)
values (true)
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and member_status = 'ACTIVE'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and (
    new.role is distinct from old.role
    or new.member_status is distinct from old.member_status
    or new.member_discount_enabled is distinct from old.member_discount_enabled
    or new.reseller_status is distinct from old.reseller_status
  ) then
    raise exception 'Only an administrator can change member privileges.';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, email, customer_type, reseller_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.email, ''),
    case
      when new.raw_user_meta_data ->> 'customer_type' in ('RESELLER', 'GROSIR')
        then new.raw_user_meta_data ->> 'customer_type'
      else 'ECER'
    end,
    case
      when new.raw_user_meta_data ->> 'customer_type' = 'RESELLER' then 'PENDING'
      else 'NONE'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists protect_profiles on public.profiles;
create trigger protect_profiles
  before update on public.profiles
  for each row execute procedure public.protect_profile_privileges();

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'categories', 'products', 'product_variants', 'orders', 'promotions',
    'banners', 'member_discounts', 'seo_pages', 'site_settings', 'carts'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', target_table);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute procedure public.set_updated_at()',
      target_table
    );
  end loop;
end
$$;

create or replace function public.create_order_request(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_address text,
  p_district text,
  p_city text,
  p_province text,
  p_postal_code text,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_user_id uuid := auth.uid();
  v_order_number text;
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_has_variant boolean;
  v_product_id uuid;
  v_variant_id uuid;
  v_quantity integer;
  v_price_type text;
  v_unit_price numeric(14, 2);
  v_line_subtotal numeric(14, 2);
  v_subtotal numeric(14, 2) := 0;
  v_discount numeric(14, 2) := 0;
  v_member_enabled boolean := false;
  v_is_member boolean := false;
  v_discount_rule record;
  v_eligible_subtotal numeric(14, 2);
  v_candidate_discount numeric(14, 2);
  v_items_json jsonb;
begin
  if length(trim(coalesce(p_customer_name, ''))) not between 2 and 120
    or length(trim(coalesce(p_customer_phone, ''))) not between 8 and 20
    or length(trim(coalesce(p_address, ''))) not between 5 and 500
    or length(trim(coalesce(p_district, ''))) not between 2 and 100
    or length(trim(coalesce(p_city, ''))) not between 2 and 100
    or length(trim(coalesce(p_province, ''))) not between 2 and 100
    or length(trim(coalesce(p_postal_code, ''))) not between 3 and 12
    or coalesce(length(p_notes), 0) > 1000
    or (
      nullif(trim(coalesce(p_customer_email, '')), '') is not null
      and trim(p_customer_email) !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    )
  then
    raise exception 'Data pemesan belum lengkap atau tidak valid.';
  end if;

  if p_items is null or jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Keranjang harus berisi daftar produk yang valid.';
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
    raise exception 'Keranjang harus berisi 1 sampai 50 produk.';
  end if;

  if v_user_id is not null then
    select p.member_status = 'ACTIVE',
           s.member_discount_enabled and p.member_discount_enabled and p.member_status = 'ACTIVE'
      into v_is_member, v_member_enabled
    from public.profiles p
    cross join public.site_settings s
    where p.id = v_user_id and s.id = true;
    v_is_member := coalesce(v_is_member, false);
    v_member_enabled := coalesce(v_member_enabled, false);
  end if;

  v_order_number := 'FB-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 5, '0');

  insert into public.orders (
    id, order_number, user_id, customer_name, customer_phone, customer_email,
    address, district, city, province, postal_code, notes, status
  ) values (
    v_order_id, v_order_number, v_user_id, trim(p_customer_name),
    trim(p_customer_phone), nullif(trim(coalesce(p_customer_email, '')), ''),
    trim(p_address), trim(p_district), trim(p_city), trim(p_province),
    trim(p_postal_code), nullif(trim(coalesce(p_notes, '')), ''),
    'WAITING_STOCK_CONFIRMATION'
  );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id := (v_item ->> 'product_id')::uuid;
      v_variant_id := nullif(v_item ->> 'variant_id', '')::uuid;
      v_quantity := (v_item ->> 'quantity')::integer;
    exception when others then
      raise exception 'Data produk dalam keranjang tidak valid.';
    end;
    v_price_type := upper(coalesce(v_item ->> 'price_type', 'ECER'));

    if v_quantity not between 1 and 99 or v_price_type not in ('ECER', 'GROSIR') then
      raise exception 'Jumlah atau jenis harga tidak valid.';
    end if;

    select * into v_product
    from public.products
    where id = v_product_id and is_active = true;

    if not found then
      raise exception 'Salah satu produk tidak lagi tersedia di katalog.';
    end if;

    v_has_variant := v_variant_id is not null;
    if v_has_variant then
      select * into v_variant
      from public.product_variants
      where id = v_variant_id and product_id = v_product.id and is_active = true;
      if not found then
        raise exception 'Varian produk sudah tidak tersedia.';
      end if;
    end if;

    v_unit_price := v_product.ecer_price;
    if v_price_type = 'GROSIR' then
      if v_product.grosir_price is null or v_quantity < v_product.grosir_min_qty then
        raise exception 'Jumlah produk belum memenuhi minimum harga grosir.';
      end if;
      v_unit_price := v_product.grosir_price;
    end if;
    if v_has_variant then
      v_unit_price := v_unit_price + v_variant.additional_price;
    end if;

    v_line_subtotal := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_subtotal;

    insert into public.order_items (
      order_id, product_id, variant_id, product_name_snapshot,
      variant_snapshot, price_type, unit_price, quantity, subtotal
    ) values (
      v_order_id, v_product.id, case when v_has_variant then v_variant.id else null end,
      v_product.name,
      case when v_has_variant then concat_ws(' / ', v_variant.name, v_variant.size, v_variant.color) else null end,
      case when v_member_enabled and v_price_type = 'ECER' then 'MEMBER' else v_price_type end,
      v_unit_price, v_quantity, v_line_subtotal
    );
  end loop;

  if v_member_enabled then
    for v_discount_rule in
      select * from public.member_discounts
      where is_active = true
        and (start_at is null or start_at <= now())
        and (end_at is null or end_at > now())
    loop
      select coalesce(sum(oi.subtotal), 0) into v_eligible_subtotal
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      where oi.order_id = v_order_id
        and (v_discount_rule.product_id is null or p.id = v_discount_rule.product_id)
        and (v_discount_rule.category_id is null or p.category_id = v_discount_rule.category_id);

      if v_eligible_subtotal >= v_discount_rule.minimum_purchase then
        v_candidate_discount := case
          when v_discount_rule.discount_type = 'PERCENTAGE'
            then round(v_eligible_subtotal * v_discount_rule.discount_value / 100, 2)
          else v_discount_rule.discount_value
        end;
        v_discount := greatest(v_discount, least(v_candidate_discount, v_eligible_subtotal));
      end if;
    end loop;
  end if;

  update public.orders
  set subtotal = v_subtotal,
      discount = v_discount,
      grand_total = greatest(0, v_subtotal - v_discount),
      updated_at = now()
  where id = v_order_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'product_name', product_name_snapshot,
    'variant', variant_snapshot,
    'quantity', quantity,
    'unit_price', unit_price,
    'subtotal', subtotal
  ) order by created_at), '[]'::jsonb)
  into v_items_json
  from public.order_items
  where order_id = v_order_id;

  return jsonb_build_object(
    'order_number', v_order_number,
    'status', 'WAITING_STOCK_CONFIRMATION',
    'subtotal', v_subtotal,
    'discount', v_discount,
    'grand_total', greatest(0, v_subtotal - v_discount),
    'customer_status', case when v_is_member then 'Member' else 'Guest' end,
    'items', v_items_json
  );
end;
$$;

create or replace function public.get_reseller_group_url()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result text;
begin
  if not public.is_active_member() then
    raise exception 'Grup WhatsApp hanya dapat diakses oleh member aktif.';
  end if;
  select reseller_whatsapp_group_url into result
  from public.site_settings
  where id = true;
  return result;
end;
$$;

create or replace function public.get_admin_reseller_group_url()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result text;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat mengakses pengaturan ini.';
  end if;
  select reseller_whatsapp_group_url into result
  from public.site_settings
  where id = true;
  return result;
end;
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.favorites enable row level security;
alter table public.promotions enable row level security;
alter table public.banners enable row level security;
alter table public.member_discounts enable row level security;
alter table public.seo_pages enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Profiles are visible to their owner or admin" on public.profiles;
drop policy if exists "Admins manage profiles" on public.profiles;
drop policy if exists "Owners update basic profile" on public.profiles;
drop policy if exists "Active categories are public" on public.categories;
drop policy if exists "Admins manage categories" on public.categories;
drop policy if exists "Active products are public" on public.products;
drop policy if exists "Admins manage products" on public.products;
drop policy if exists "Active variants of public products are public" on public.product_variants;
drop policy if exists "Admins manage variants" on public.product_variants;
drop policy if exists "Images of public products are public" on public.product_images;
drop policy if exists "Admins manage product images" on public.product_images;
drop policy if exists "Owners manage carts" on public.carts;
drop policy if exists "Owners manage cart items" on public.cart_items;
drop policy if exists "Customers see their orders" on public.orders;
drop policy if exists "Admins manage orders" on public.orders;
drop policy if exists "Customers see their order items" on public.order_items;
drop policy if exists "Admins manage order items" on public.order_items;
drop policy if exists "Owners manage favorites" on public.favorites;
drop policy if exists "Active banners are public" on public.banners;
drop policy if exists "Admins manage banners" on public.banners;
drop policy if exists "Admins manage promotions" on public.promotions;
drop policy if exists "Admins manage member discounts" on public.member_discounts;
drop policy if exists "Admins manage SEO pages" on public.seo_pages;
drop policy if exists "Admins manage site settings" on public.site_settings;
drop policy if exists "Public reads storefront settings" on public.site_settings;

create policy "Profiles are visible to their owner or admin"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "Admins manage profiles"
  on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Owners update basic profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Active categories are public"
  on public.categories for select to anon, authenticated using (is_active or public.is_admin());
create policy "Admins manage categories"
  on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Active products are public"
  on public.products for select to anon, authenticated using (is_active or public.is_admin());
create policy "Admins manage products"
  on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Active variants of public products are public"
  on public.product_variants for select to anon, authenticated
  using (
    is_active
    and exists (select 1 from public.products p where p.id = product_id and p.is_active)
    or public.is_admin()
  );
create policy "Admins manage variants"
  on public.product_variants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Images of public products are public"
  on public.product_images for select to anon, authenticated
  using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active)
    or public.is_admin()
  );
create policy "Admins manage product images"
  on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Owners manage carts"
  on public.carts for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy "Owners manage cart items"
  on public.cart_items for all to authenticated
  using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
    or public.is_admin()
  );

create policy "Customers see their orders"
  on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "Admins manage orders"
  on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Customers see their order items"
  on public.order_items for select to authenticated
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
    or public.is_admin()
  );
create policy "Admins manage order items"
  on public.order_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Owners manage favorites"
  on public.favorites for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "Active banners are public"
  on public.banners for select to anon, authenticated
  using (is_active and (start_at is null or start_at <= now()) and (end_at is null or end_at > now()) or public.is_admin());
create policy "Admins manage banners"
  on public.banners for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage promotions"
  on public.promotions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage member discounts"
  on public.member_discounts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage SEO pages"
  on public.seo_pages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage site settings"
  on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Public reads storefront settings"
  on public.site_settings for select to anon, authenticated
  using (id = true);

create or replace view public.public_site_settings
with (security_invoker = true)
as
select
  id, site_name, logo_url, favicon_url, whatsapp_admin_number,
  instagram_url, tiktok_url, facebook_url, address, email, phone,
  member_program_enabled, member_discount_enabled,
  member_program_description, reseller_program_description,
  default_seo_title, default_meta_description, created_at, updated_at
from public.site_settings
where id = true;

grant usage on schema public to anon, authenticated;
grant select on public.public_site_settings to anon, authenticated;
grant select (
  id, site_name, logo_url, favicon_url, whatsapp_admin_number,
  instagram_url, tiktok_url, facebook_url, address, email, phone,
  member_program_enabled, member_discount_enabled,
  member_program_description, reseller_program_description,
  default_seo_title, default_meta_description, created_at, updated_at
) on public.site_settings to anon, authenticated;
grant select on public.categories, public.products, public.product_variants, public.product_images to anon, authenticated;
grant select, insert, update, delete on public.carts, public.cart_items, public.favorites to authenticated;
grant select on public.profiles, public.orders, public.order_items to authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant update on public.orders to authenticated;
grant all on public.categories, public.products, public.product_variants, public.product_images,
  public.promotions, public.banners, public.member_discounts, public.seo_pages,
  public.orders, public.order_items, public.profiles to authenticated;
grant update (
  whatsapp_admin_number, reseller_whatsapp_group_url, address, email, phone,
  instagram_url, tiktok_url, facebook_url
) on public.site_settings to authenticated;
grant execute on function public.create_order_request(text, text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;
revoke all on function public.get_reseller_group_url() from public, anon;
grant execute on function public.get_reseller_group_url() to authenticated;
revoke all on function public.get_admin_reseller_group_url() from public, anon;
grant execute on function public.get_admin_reseller_group_url() to authenticated;
revoke all on sequence public.order_number_seq from public, anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('category-images', 'category-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('banner-images', 'banner-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('site-assets', 'site-assets', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

drop policy if exists "Public reads storefront media" on storage.objects;
drop policy if exists "Admins upload storefront media" on storage.objects;
drop policy if exists "Admins update storefront media" on storage.objects;
drop policy if exists "Admins delete storefront media" on storage.objects;

create policy "Public reads storefront media"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('product-images', 'category-images', 'banner-images', 'site-assets'));
create policy "Admins upload storefront media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('product-images', 'category-images', 'banner-images', 'site-assets')
    and public.is_admin()
  );
create policy "Admins update storefront media"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('product-images', 'category-images', 'banner-images', 'site-assets')
    and public.is_admin()
  )
  with check (
    bucket_id in ('product-images', 'category-images', 'banner-images', 'site-assets')
    and public.is_admin()
  );
create policy "Admins delete storefront media"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('product-images', 'category-images', 'banner-images', 'site-assets')
    and public.is_admin()
  );
