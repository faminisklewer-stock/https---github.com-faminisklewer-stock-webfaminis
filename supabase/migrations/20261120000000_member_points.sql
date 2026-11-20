create table if not exists public.member_point_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_point_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  transaction_id uuid,
  ledger_type text not null check (ledger_type in ('EARN', 'REDEEM', 'ADJUSTMENT', 'VOID')),
  points integer not null,
  balance_before integer not null check (balance_before >= 0),
  balance_after integer not null check (balance_after >= 0),
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.member_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  reference text not null,
  purchase_date date not null,
  paid_at timestamptz,
  gross_total numeric(14, 2) not null check (gross_total >= 0),
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'CANCELLED')),
  points_awarded integer not null default 0 check (points_awarded >= 0),
  source text not null default 'ADMIN' check (source in ('ADMIN', 'WEBSITE', 'WHATSAPP')),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.member_transactions(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  subtotal numeric(14, 2) not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.member_vouchers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique,
  value numeric(14, 2) not null default 10000 check (value >= 0),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'USED', 'VOID')),
  redeemed_at timestamptz not null default now(),
  expires_at timestamptz,
  used_at timestamptz,
  used_reference text,
  created_at timestamptz not null default now()
);

alter table public.member_point_ledger
  add constraint member_point_ledger_transaction_fkey
  foreign key (transaction_id) references public.member_transactions(id) on delete set null;

create index if not exists member_transactions_user_date_idx
  on public.member_transactions(user_id, purchase_date desc);
create index if not exists member_transaction_items_transaction_idx
  on public.member_transaction_items(transaction_id);
create index if not exists member_point_ledger_user_date_idx
  on public.member_point_ledger(user_id, created_at desc);
create index if not exists member_vouchers_user_status_idx
  on public.member_vouchers(user_id, status);

create or replace function public.ensure_member_point_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.member_point_accounts(user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;
end;
$$;

insert into public.member_point_accounts(user_id, balance)
select id, 0 from public.profiles
on conflict (user_id) do nothing;

create or replace function public.create_member_point_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.member_point_accounts(user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_member_point_account on public.profiles;
create trigger on_profile_member_point_account
  after insert on public.profiles
  for each row execute procedure public.create_member_point_account();

create or replace function public.complete_member_transaction(p_transaction_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  tx record;
  account record;
  earned integer;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat menyelesaikan transaksi.';
  end if;

  select * into tx from public.member_transactions where id = p_transaction_id for update;
  if not found then raise exception 'Transaksi tidak ditemukan.'; end if;
  if tx.status = 'CANCELLED' then raise exception 'Transaksi dibatalkan tidak dapat diselesaikan.'; end if;
  if tx.status = 'PAID' then return tx.points_awarded; end if;

  earned := floor(tx.gross_total / 100000)::integer * 10;
  perform public.ensure_member_point_account(tx.user_id);
  select * into account from public.member_point_accounts where user_id = tx.user_id for update;

  update public.member_transactions
  set status = 'PAID', paid_at = now(), points_awarded = earned, updated_at = now()
  where id = p_transaction_id;

  if earned > 0 then
    insert into public.member_point_ledger(
      user_id, transaction_id, ledger_type, points,
      balance_before, balance_after, description, created_by
    )
    values (
      tx.user_id, p_transaction_id, 'EARN', earned,
      account.balance, account.balance + earned,
      'Poin dari transaksi ' || tx.reference,
      auth.uid()
    );
    update public.member_point_accounts
    set balance = account.balance + earned, updated_at = now()
    where user_id = tx.user_id;
  end if;

  return earned;
end;
$$;

create or replace function public.cancel_member_transaction(p_transaction_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tx record;
  account record;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat membatalkan transaksi.';
  end if;
  select * into tx from public.member_transactions where id = p_transaction_id for update;
  if not found then raise exception 'Transaksi tidak ditemukan.'; end if;
  if tx.status = 'CANCELLED' then return; end if;

  if tx.status = 'PAID' and tx.points_awarded > 0 then
    perform public.ensure_member_point_account(tx.user_id);
    select * into account from public.member_point_accounts where user_id = tx.user_id for update;
    if account.balance < tx.points_awarded then
      raise exception 'Saldo poin tidak cukup untuk membatalkan transaksi.';
    end if;
    update public.member_point_accounts
    set balance = account.balance - tx.points_awarded, updated_at = now()
    where user_id = tx.user_id;
    insert into public.member_point_ledger(
      user_id, transaction_id, ledger_type, points,
      balance_before, balance_after, description, created_by
    )
    values (
      tx.user_id, p_transaction_id, 'VOID', tx.points_awarded,
      account.balance, account.balance - tx.points_awarded,
      'Pembatalan poin transaksi ' || tx.reference,
      auth.uid()
    );
  end if;

  update public.member_transactions
  set status = 'CANCELLED', paid_at = null, points_awarded = 0, updated_at = now()
  where id = p_transaction_id;
end;
$$;

create or replace function public.redeem_member_voucher()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  account record;
  voucher_code text;
begin
  if auth.uid() is null then raise exception 'Silakan masuk terlebih dahulu.'; end if;
  perform public.ensure_member_point_account(auth.uid());
  select * into account from public.member_point_accounts where user_id = auth.uid() for update;
  if account.balance < 100 then raise exception 'Poin belum cukup untuk penukaran.'; end if;

  voucher_code := 'FB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into public.member_vouchers(user_id, code, value)
  values (auth.uid(), voucher_code, 10000);

  insert into public.member_point_ledger(
    user_id, ledger_type, points, balance_before, balance_after,
    description
  )
  values (
    auth.uid(), 'REDEEM', 100,
    account.balance, account.balance - 100,
    'Penukaran voucher belanja Rp10.000'
  );

  update public.member_point_accounts
  set balance = account.balance - 100, updated_at = now()
  where user_id = auth.uid();

  return voucher_code;
end;
$$;

alter table public.member_point_accounts enable row level security;
alter table public.member_point_ledger enable row level security;
alter table public.member_transactions enable row level security;
alter table public.member_transaction_items enable row level security;
alter table public.member_vouchers enable row level security;

create policy "Point owners and admins see accounts"
  on public.member_point_accounts for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "Admins manage point accounts"
  on public.member_point_accounts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Point owners and admins see ledger"
  on public.member_point_ledger for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "Admins manage point ledger"
  on public.member_point_ledger for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Transaction owners and admins see transactions"
  on public.member_transactions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "Admins manage transactions"
  on public.member_transactions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Transaction owners and admins see transaction items"
  on public.member_transaction_items for select to authenticated
  using (
    exists (
      select 1 from public.member_transactions tx
      where tx.id = transaction_id and tx.user_id = auth.uid()
    ) or public.is_admin()
  );
create policy "Admins manage transaction items"
  on public.member_transaction_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Voucher owners and admins see vouchers"
  on public.member_vouchers for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "Admins manage vouchers"
  on public.member_vouchers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant execute on function public.complete_member_transaction(uuid) to authenticated;
grant execute on function public.cancel_member_transaction(uuid) to authenticated;
grant execute on function public.redeem_member_voucher() to authenticated;
grant execute on function public.ensure_member_point_account(uuid) to authenticated;
