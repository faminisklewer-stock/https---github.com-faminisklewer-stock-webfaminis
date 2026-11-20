import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redeemVoucher, signOutCustomer } from "./actions";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const [profileResult, accountResult, ledgerResult, transactionResult, voucherResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, phone").eq("id", authData.user.id).maybeSingle(),
    supabase.from("member_point_accounts").select("balance").eq("user_id", authData.user.id).maybeSingle(),
    supabase.from("member_point_ledger").select("id, ledger_type, points, description, created_at").eq("user_id", authData.user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("member_transactions").select("id, reference, purchase_date, paid_at, gross_total, status, points_awarded, source, notes").eq("user_id", authData.user.id).order("purchase_date", { ascending: false }).limit(50),
    supabase.from("member_vouchers").select("id, code, value, status, redeemed_at, expires_at, used_at, used_reference").eq("user_id", authData.user.id).order("redeemed_at", { ascending: false }).limit(50),
  ]);

  if (profileResult.error) throw new Error(`Gagal memuat profil: ${profileResult.error.message}`);

  const profile = profileResult.data;
  const balance = accountResult.data?.balance ?? 0;
  const ledger = ledgerResult.data ?? [];
  const transactions = transactionResult.data ?? [];
  const vouchers = voucherResult.data ?? [];
  const params = await searchParams;
  const redemptionCode = typeof params.voucher === "string" ? params.voucher : "";
  const redemptionError = typeof params.error === "string" ? params.error : "";

  const transactionIds = transactions.map((transaction) => transaction.id);
  const { data: items } = transactionIds.length
    ? await supabase.from("member_transaction_items").select("transaction_id, product_name, sku, quantity, unit_price, subtotal").in("transaction_id", transactionIds)
    : { data: [] };

  const totalSpent = transactions
    .filter((transaction) => transaction.status === "PAID")
    .reduce((total, transaction) => total + Number(transaction.gross_total), 0);

  const ledgerLabels = { EARN: "Poin diperoleh", REDEEM: "Poin ditukarkan", ADJUSTMENT: "Penyesuaian poin", VOID: "Poin dibatalkan" } as const;

  return (
    <main className="member-dashboard page-wrap" id="konten-utama">
      <header className="member-dashboard-header">
        <div>
          <p className="section-eyebrow">Area member</p>
          <h1>Halo, {profile?.full_name || "Member"}</h1>
        </div>
        <form action={signOutCustomer}>
          <button type="submit" className="button button-secondary">Keluar</button>
        </form>
      </header>

      {redemptionCode ? (
        <section className="member-redemption-success" role="status">
          <strong>Voucher berhasil dibuat</strong>
          <code>{redemptionCode}</code>
          <span>Nilai Rp10.000, gunakan saat transaksi sesuai ketentuan Admin.</span>
        </section>
      ) : null}

      {redemptionError ? (
        <section className="member-redemption-error" role="alert">
          <strong>Penukaran belum berhasil</strong>
          <span>{redemptionError}</span>
        </section>
      ) : null}

      <section className="member-summary" aria-label="Ringkasan member">
        <article>
          <span>Saldo poin</span>
          <strong>{balance} poin</strong>
          <small>{100 - (balance % 100)} poin menuju penukaran berikutnya</small>
        </article>
        <article>
          <span>Total belanja lunas</span>
          <strong>{formatRupiah(totalSpent)}</strong>
          <small>{transactions.filter((transaction) => transaction.status === "PAID").length} transaksi berhasil</small>
        </article>
        <article>
          <span>Voucher aktif</span>
          <strong>{vouchers.filter((voucher) => voucher.status === "ACTIVE").length}</strong>
          <small>Nilai Rp10.000 per voucher</small>
        </article>
      </section>

      <aside className="member-points-note">
        <strong>Poin berlaku untuk belanja online maupun offline.</strong>
        <span>Poin diberikan setelah transaksi lunas dan dicatat pada akun ini. Untuk pembelian offline, pastikan Admin mengetahui email akun Faminis Barokah Anda.</span>
      </aside>

      <section className="member-redeem">
        <div>
          <p className="section-eyebrow">Penukaran poin</p>
          <h2>Voucher Rp10.000</h2>
          <p>Tukarkan 100 poin dengan satu voucher belanja.</p>
        </div>
        <form action={redeemVoucher}>
          <button type="submit" className="button button-primary" disabled={balance < 100}>
            {balance >= 100 ? "Tukarkan 100 poin" : `Butuh ${100 - balance} poin lagi`}
          </button>
        </form>
      </section>

      <section className="member-section">
        <div className="member-section-heading">
          <div><p className="section-eyebrow">Pembelian</p><h2>Riwayat transaksi</h2></div>
        </div>
        {transactions.length ? (
          <div className="member-transaction-list">
            {transactions.map((transaction) => {
              const transactionItems = (items ?? []).filter((item) => item.transaction_id === transaction.id);
              return (
                <article className="member-transaction" key={transaction.id}>
                  <header>
                    <div><strong>{transaction.reference}</strong><small>{new Date(transaction.purchase_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</small></div>
                    <span className={`member-status status-${transaction.status.toLowerCase()}`}>{transaction.status === "PAID" ? "Lunas" : transaction.status === "PENDING" ? "Menunggu" : "Dibatalkan"}</span>
                  </header>
                  {transactionItems.length ? (
                    <ul>
                      {transactionItems.map((item) => (
                        <li key={`${item.transaction_id}-${item.product_name}-${item.sku ?? ""}`}>
                          <span>{item.product_name}<small>{item.quantity} x {formatRupiah(Number(item.unit_price))}{item.sku ? ` - SKU ${item.sku}` : ""}</small></span>
                          <strong>{formatRupiah(Number(item.subtotal))}</strong>
                        </li>
                      ))}
                    </ul>
                  ) : <p>Rincian produk belum tersedia.</p>}
                  <footer><span>Total belanja</span><strong>{formatRupiah(Number(transaction.gross_total))}</strong>{transaction.status === "PAID" ? <small>+{transaction.points_awarded} poin</small> : null}</footer>
                </article>
              );
            })}
          </div>
        ) : <div className="member-empty"><strong>Belum ada transaksi</strong><p>Transaksi yang sudah lunas akan tampil di sini setelah dicatat Admin.</p></div>}
      </section>

      <div className="member-history-grid">
        <section className="member-section">
          <div className="member-section-heading"><div><p className="section-eyebrow">Poin</p><h2>Riwayat perolehan</h2></div></div>
          {ledger.length ? (
            <ul className="member-ledger-list">
              {ledger.map((entry) => (
                <li key={entry.id}>
                  <div><strong>{ledgerLabels[entry.ledger_type]}</strong><small>{entry.description || "Mutasi poin member"} - {new Date(entry.created_at).toLocaleDateString("id-ID")}</small></div>
                  <strong className={entry.ledger_type === "REDEEM" || entry.ledger_type === "VOID" ? "points-out" : "points-in"}>
                    {entry.ledger_type === "REDEEM" || entry.ledger_type === "VOID" ? "-" : "+"}{entry.points} poin
                  </strong>
                </li>
              ))}
            </ul>
          ) : <div className="member-empty"><strong>Belum ada mutasi poin</strong></div>}
        </section>

        <section className="member-section">
          <div className="member-section-heading"><div><p className="section-eyebrow">Voucher</p><h2>Riwayat penukaran</h2></div></div>
          {vouchers.length ? (
            <ul className="member-voucher-list">
              {vouchers.map((voucher) => (
                <li key={voucher.id}>
                  <div><code>{voucher.code}</code><small>{new Date(voucher.redeemed_at).toLocaleDateString("id-ID")}</small></div>
                  <strong>{formatRupiah(Number(voucher.value))}</strong>
                  <span>{voucher.status === "ACTIVE" ? "Aktif" : voucher.status === "USED" ? "Sudah digunakan" : "Dibatalkan"}</span>
                </li>
              ))}
            </ul>
          ) : <div className="member-empty"><strong>Belum ada voucher</strong><p>Voucher dapat dibuat setelah saldo mencapai 100 poin.</p></div>}
        </section>
      </div>
    </main>
  );
}
