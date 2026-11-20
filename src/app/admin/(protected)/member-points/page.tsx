import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/admin";
import { formatRupiah } from "@/lib/format";
import {
  adjustMemberPoints,
  cancelMemberTransaction,
  completeMemberTransaction,
  createMemberTransaction,
  updateMemberVoucher,
} from "@/app/admin/actions";

export default async function AdminMemberPointsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const [membersResult, accountsResult, transactionsResult, vouchersResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, phone").eq("role", "CUSTOMER").eq("member_status", "ACTIVE").order("full_name"),
    supabase.from("member_point_accounts").select("user_id, balance"),
    supabase.from("member_transactions").select("id, user_id, reference, purchase_date, gross_total, status, points_awarded, source, notes").order("purchase_date", { ascending: false }).limit(100),
    supabase.from("member_vouchers").select("id, user_id, code, value, status, redeemed_at, used_at, used_reference").order("redeemed_at", { ascending: false }).limit(100),
  ]);
  if (membersResult.error) throw new Error(`Gagal memuat member: ${membersResult.error.message}`);

  const members = membersResult.data ?? [];
  const accountMap = new Map((accountsResult.data ?? []).map((account) => [account.user_id, account.balance]));
  const memberMap = new Map(members.map((member) => [member.id, member]));
  const transactions = transactionsResult.data ?? [];
  const vouchers = vouchersResult.data ?? [];

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="Program member"
        title="Poin, transaksi, dan voucher"
        description="Catat pembelian lunas, kelola saldo poin, dan pantau voucher member."
      />
      <AdminFeedback searchParams={params} />

      <div className="admin-points-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><p className="section-eyebrow">Transaksi</p><h2>Catat pembelian member</h2></div>
          </div>
          <form action={createMemberTransaction} className="admin-member-transaction-form">
            <label className="field-label">Member
              <select name="user_id" required>
                <option value="">Pilih member</option>
                {members.map((member) => (
                  <option value={member.id} key={member.id}>{member.full_name || member.email || "Member"}{member.phone ? ` - ${member.phone}` : ""}</option>
                ))}
              </select>
            </label>
            <label className="field-label">Nomor transaksi / nota
              <input name="reference" required placeholder="INV-20261120-001" />
            </label>
            <label className="field-label">Tanggal pembelian
              <input name="purchase_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </label>
            <label className="field-label">Sumber
              <select name="source" defaultValue="ADMIN">
                <option value="ADMIN">Penjualan offline</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="WEBSITE">Website</option>
              </select>
            </label>
            <label className="field-label">Status
              <select name="status" defaultValue="PAID">
                <option value="PAID">Lunas</option>
                <option value="PENDING">Belum lunas</option>
              </select>
            </label>
            <label className="field-label">Nama produk
              <input name="product_name" required placeholder="Mukena Premium 05" />
            </label>
            <label className="field-label">SKU
              <input name="sku" placeholder="Opsional" />
            </label>
            <label className="field-label">Jumlah
              <input name="quantity" type="number" min="1" max="99" defaultValue="1" required />
            </label>
            <label className="field-label">Harga satuan
              <input name="unit_price" type="number" min="0" step="100" required />
            </label>
            <label className="field-label">Total belanja
              <input name="gross_total" type="number" min="0" step="100" required />
            </label>
            <label className="field-label admin-form-wide">Catatan
              <textarea name="notes" rows={3} />
            </label>
            <button type="submit" className="button button-primary admin-form-wide">Simpan transaksi</button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><p className="section-eyebrow">Penyesuaian</p><h2>Kelola saldo poin</h2></div>
          </div>
          <form action={adjustMemberPoints} className="admin-member-adjust-form">
            <label className="field-label">Member
              <select name="user_id" required>
                <option value="">Pilih member</option>
                {members.map((member) => (
                  <option value={member.id} key={member.id}>{member.full_name || member.email || "Member"} - {accountMap.get(member.id) ?? 0} poin</option>
                ))}
              </select>
            </label>
            <label className="field-label">Jumlah poin
              <input name="points" type="number" min="-100000" max="100000" required placeholder="Contoh: 50 atau -20" />
            </label>
            <label className="field-label">Alasan
              <input name="description" required placeholder="Koreksi poin atau pemberian khusus" />
            </label>
            <button type="submit" className="button button-secondary">Simpan penyesuaian</button>
          </form>
        </section>
      </div>

      <section className="admin-panel admin-member-transactions">
        <div className="admin-panel-heading">
          <div><p className="section-eyebrow">Riwayat</p><h2>Transaksi member</h2></div>
        </div>
        {transactions.length ? (
          <div className="admin-record-list">
            {transactions.map((transaction) => {
              const member = memberMap.get(transaction.user_id);
              return (
                <article className="admin-record" key={transaction.id}>
                  <div>
                    <h3>{transaction.reference}</h3>
                    <p>{member?.full_name || member?.email || "Member"} - {new Date(transaction.purchase_date).toLocaleDateString("id-ID")}</p>
                    <small>{transaction.source} - {formatRupiah(Number(transaction.gross_total))}</small>
                  </div>
                  <div className="admin-member-states">
                    <div><span>Status</span><strong>{transaction.status === "PAID" ? "Lunas" : transaction.status === "PENDING" ? "Menunggu" : "Dibatalkan"}</strong></div>
                    <div><span>Poin</span><strong>{transaction.points_awarded} poin</strong></div>
                  </div>
                  <div className="admin-inline-actions">
                    {transaction.status === "PENDING" ? (
                      <form action={completeMemberTransaction}><input type="hidden" name="id" value={transaction.id} /><button type="submit" className="button button-primary">Tandai lunas</button></form>
                    ) : null}
                    {transaction.status !== "CANCELLED" ? (
                      <form action={cancelMemberTransaction}><input type="hidden" name="id" value={transaction.id} /><button type="submit" className="button button-secondary">Batalkan</button></form>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="admin-state-panel"><h3>Belum ada transaksi member</h3></div>}
      </section>

      <section className="admin-panel admin-member-vouchers">
        <div className="admin-panel-heading">
          <div><p className="section-eyebrow">Voucher</p><h2>Voucher penukaran poin</h2></div>
        </div>
        {vouchers.length ? (
          <div className="admin-record-list">
            {vouchers.map((voucher) => {
              const member = memberMap.get(voucher.user_id);
              return (
                <article className="admin-record" key={voucher.id}>
                  <div><code>{voucher.code}</code><p>{member?.full_name || member?.email || "Member"} - {formatRupiah(Number(voucher.value))}</p></div>
                  <strong>{voucher.status === "ACTIVE" ? "Aktif" : voucher.status === "USED" ? "Sudah digunakan" : "Dibatalkan"}</strong>
                  {voucher.status === "ACTIVE" ? (
                    <form action={updateMemberVoucher} className="admin-voucher-actions">
                      <input type="hidden" name="id" value={voucher.id} />
                      <input name="reference" placeholder="Nomor transaksi saat digunakan" />
                      <button type="submit" name="action" value="USE" className="button button-primary">Gunakan</button>
                      <button type="submit" name="action" value="VOID" className="button button-secondary">Batalkan</button>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : <div className="admin-state-panel"><h3>Belum ada voucher</h3></div>}
      </section>
    </main>
  );
}
