import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { requireAdmin } from "@/lib/admin";
import { updateMember } from "@/app/admin/actions";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data, error } = await supabase.from("profiles")
    .select("id, full_name, phone, email, customer_type, member_status, member_discount_enabled, reseller_status, created_at")
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(`Gagal memuat member: ${error.message}`);

  return (
    <main className="admin-page">
      <div className="admin-page-heading"><div><p className="section-eyebrow">Akun pelanggan</p><h1>Member dan reseller</h1></div></div>
      <AdminFeedback searchParams={params} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Nama dan kontak</th><th>Jenis</th><th>Status member</th><th>Status reseller</th><th>Terdaftar</th><th>Perbarui</th></tr></thead>
          <tbody>
            {(data ?? []).map((member) => (
              <tr key={member.id}>
                <td><strong>{member.full_name || "Nama belum diisi"}</strong><small>{member.email}</small><small>{member.phone}</small></td>
                <td>{member.customer_type}</td>
                <td>{member.member_status}</td>
                <td>{member.reseller_status}</td>
                <td>{new Date(member.created_at).toLocaleDateString("id-ID")}</td>
                <td>
                  <form action={updateMember} className="member-edit-form">
                    <input type="hidden" name="id" value={member.id} />
                    <select name="member_status" defaultValue={member.member_status} aria-label={`Status member ${member.full_name}`}>
                      <option value="ACTIVE">Aktif</option><option value="INACTIVE">Nonaktif</option>
                    </select>
                    <select name="customer_type" defaultValue={member.customer_type} aria-label={`Jenis pelanggan ${member.full_name}`}>
                      <option value="ECER">Ecer</option><option value="RESELLER">Reseller</option><option value="GROSIR">Grosir</option>
                    </select>
                    <select name="reseller_status" defaultValue={member.reseller_status} aria-label={`Status reseller ${member.full_name}`}>
                      <option value="NONE">Belum mengajukan</option><option value="PENDING">Menunggu</option><option value="APPROVED">Disetujui</option>
                    </select>
                    <label className="check-label"><input type="checkbox" name="member_discount_enabled" defaultChecked={member.member_discount_enabled} /> Diskon</label>
                    <button type="submit" className="admin-row-link">Simpan</button>
                  </form>
                </td>
              </tr>
            ))}
            {!data?.length ? <tr><td colSpan={6}>Belum ada member terdaftar.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
