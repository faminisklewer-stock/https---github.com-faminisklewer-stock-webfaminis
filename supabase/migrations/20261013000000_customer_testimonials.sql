create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 100),
  content text not null check (char_length(trim(content)) between 5 and 1200),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists "Public can view active testimonials" on public.testimonials;
drop policy if exists "Admins manage testimonials" on public.testimonials;

create policy "Public can view active testimonials"
  on public.testimonials for select to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "Admins manage testimonials"
  on public.testimonials for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;

drop trigger if exists set_updated_at on public.testimonials;
create trigger set_updated_at before update on public.testimonials
  for each row execute procedure public.set_updated_at();

create index if not exists testimonials_active_sort_idx
  on public.testimonials (sort_order, created_at desc)
  where is_active = true;
