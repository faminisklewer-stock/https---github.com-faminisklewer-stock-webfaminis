import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/admin";
import { updateMember } from "@/app/admin/actions";

const customerTypeLabels = { ECER: "Ecer", RESELLER: "Reseller", GROSIR: "Grosir" } as const;
const memberStatusLabels = { ACTIVE: "Aktif", INACTIVE: "Nonaktif" } as const;
const resellerStatusLabels = { NONE: "Belum mengajukan", PENDING: "Menunggu", APPROVED: "Disetujui" } as const;

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data, error } = await supabase.from("profiles")
    .select("id, full_name, phone, email, customer_type, member_status, member_discount_enabled, reseller_status, created_at")
    .eq("role", "CUSTOMER")
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(`Gagal memuat member: ${error.message}`);
  const members = data ?? [];

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="Akun pelanggan"
        title="Member dan reseller"
        description="Tinjau status akun dan persetujuan reseller. Perubahan di bawah langsung diterapkan pada akun."
      />
      <AdminFeedback searchParams={params} />
      <div className="admin-list-intro">
        <strong>{members.length} akun ditampilkan{members.length === 100 ? " (maksimal 100 terbaru)" : ""}</strong>
        <span>{members.filter((member) => member.reseller_status === "PENDING").length} pengajuan reseller menunggu</span>
      </div>
      {members.length ? (
        <div className="admin-record-list member-record-list">
          {members.map((member) => (
            <article className="admin-record member-record" key={member.id}>
              <div className="admin-member-identity">
                <span className="admin-member-avatar" aria-hidden="true">
                  {member.full_name?.trim().slice(0, 1).toLocaleUpperCase("id-ID") || "?"}
                </span>
                <div>
                  <h2>{member.full_name || "Nama belum diisi"}</h2>
                  {member.email ? <a href={`mailto:${member.email}`}>{member.email}</a> : <span className="admin-member-date">Email belum diisi</span>}
                  {member.phone ? <a href={`tel:${member.phone}`}>{member.phone}</a> : <span className="admin-member-date">Nomor telepon belum diisi</span>}
                  <span className="admin-member-date">Terdaftar {new Date(member.created_at).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
              <div className="admin-member-states">
                <div><span>Jenis akun</span><strong>{customerTypeLabels[member.customer_type]}</strong></div>
                <div><span>Status member</span><strong className={`admin-status ${member.member_status === "ACTIVE" ? "status-active" : "status-inactive"}`}>{memberStatusLabels[member.member_status]}</strong></div>
                <div><span>Pengajuan reseller</span><strong className={`admin-status ${member.reseller_status === "APPROVED" ? "status-active" : member.reseller_status === "PENDING" ? "status-pending" : "status-inactive"}`}>{resellerStatusLabels[member.reseller_status]}</strong></div>
                <div><span>Diskon member</span><strong>{member.member_discount_enabled ? "Diizinkan" : "Tidak diizinkan"}</strong></div>
              </div>
              <details className="admin-inline-editor">
                <summary>Ubah status dan jenis akun</summary>
                <form action={updateMember} className="member-edit-form">
                  <input type="hidden" name="id" value={member.id} />
                  <label className="field-label">Status member
                    <select name="member_status" defaultValue={member.member_status}>
                      <option value="ACTIVE">Aktif</option><option value="INACTIVE">Nonaktif</option>
                    </select>
                  </label>
                  <label className="field-label">Jenis akun
                    <select name="customer_type" defaultValue={member.customer_type}>
                      <option value="ECER">Ecer</option><option value="RESELLER">Reseller</option><option value="GROSIR">Grosir</option>
                    </select>
                  </label>
                  <label className="field-label">Status reseller
                    <select name="reseller_status" defaultValue={member.reseller_status}>
                      <option value="NONE">Belum mengajukan</option><option value="PENDING">Menunggu</option><option value="APPROVED">Disetujui</option>
                    </select>
                  </label>
                  <label className="check-label"><input type="checkbox" name="member_discount_enabled" defaultChecked={member.member_discount_enabled} /> Izinkan diskon member</label>
                  <button type="submit" className="button button-secondary">Simpan perubahan</button>
                </form>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <section className="admin-state-panel">
          <h2>Belum ada akun pelanggan</h2>
          <p>Akun baru akan muncul di sini setelah pelanggan mendaftar.</p>
        </section>
      )}
    </main>
  );
}
