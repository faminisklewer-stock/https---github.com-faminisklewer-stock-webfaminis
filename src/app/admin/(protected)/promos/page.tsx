import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { createPromoCard, deletePromoCard, updatePromoCard } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";

export default async function AdminPromosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data: promos, error } = await supabase.from("promo_cards")
    .select("id, title, description, image_url, destination_url, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("Admin promo cards could not be loaded.", error);
    return (
      <main className="admin-page">
        <AdminPageHeader
          eyebrow="Konten publik"
          title="Promo dan carousel Beranda"
          description="Kelola gambar, tujuan tautan, dan urutan slide yang tampil di dua carousel Beranda serta halaman Promo."
        />
        <section className="admin-state-panel" role="alert">
          <h2>Daftar promo belum dapat dimuat</h2>
          <p>Pastikan migrasi promo terbaru sudah dijalankan di Supabase, lalu muat ulang halaman ini.</p>
          <form action="/admin/promos" method="get">
            <button className="button button-secondary" type="submit">Muat ulang</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="Konten publik"
        title="Promo dan carousel Beranda"
        description="Setiap promo aktif dengan gambar tampil pada carousel Beranda dan halaman Promo."
      />
      <AdminFeedback searchParams={params} />
      <section className="admin-settings-panel admin-promo-create">
        <form action={createPromoCard} className="admin-form">
          <fieldset className="admin-form-section">
            <legend>Tambah promo dan slide Beranda</legend>
            <div className="field-grid">
              <label className="field-label">Judul promo<input name="title" required minLength={2} maxLength={160} /></label>
              <label className="field-label">Tautan tujuan HTTPS<input name="destination_url" type="url" placeholder="https://..." required /></label>
              <label className="field-label">Urutan tampil<input name="sort_order" type="number" defaultValue={0} min={-100000} max={100000} required /></label>
            </div>
            <label className="field-label">Keterangan<textarea name="description" maxLength={1000} /></label>
            <ImageUploader
              bucket="site-assets"
              fieldName="image_url"
              label="Gambar promo dan carousel (wajib)"
              maxFileSizeMB={5}
              helperText="Gunakan gambar 1600 x 900 px (rasio 16:9). Gambar akan dipotong agar pas di carousel Beranda."
            />
            <div className="admin-form-actions">
              <label className="check-label"><input type="checkbox" name="is_active" defaultChecked /> Tampilkan di Beranda dan halaman Promo</label>
              <button className="button button-primary" type="submit">Tambah promo</button>
            </div>
          </fieldset>
        </form>
      </section>
      <div className="admin-list-intro">
        <strong>Promo tersimpan</strong>
        <span>{(promos ?? []).filter((promo) => promo.is_active).length} sedang ditampilkan</span>
      </div>
      {promos?.length ? (
        <div className="admin-edit-list admin-promo-list">
          {promos.map((promo) => (
            <details className="admin-promo-item" key={promo.id}>
              <summary>
                <span className="admin-category-title">{promo.title}</span>
                <span className={`admin-status ${promo.is_active ? "status-active" : "status-inactive"}`}>
                  {promo.is_active ? "Tayang" : "Disembunyikan"}
                </span>
                <span className="admin-expand-label">Kelola</span>
              </summary>
              <div className="admin-promo-editor">
                <form action={updatePromoCard} className="admin-form">
                  <input type="hidden" name="id" value={promo.id} />
                  <div className="field-grid">
                    <label className="field-label">Judul promo<input name="title" defaultValue={promo.title} required minLength={2} maxLength={160} /></label>
                    <label className="field-label">Tautan tujuan HTTPS<input name="destination_url" type="url" defaultValue={promo.destination_url} required /></label>
                    <label className="field-label">Urutan tampil<input name="sort_order" type="number" defaultValue={promo.sort_order} min={-100000} max={100000} required /></label>
                  </div>
                  <label className="field-label">Keterangan<textarea name="description" defaultValue={promo.description ?? ""} maxLength={1000} /></label>
                  <ImageUploader
                    bucket="site-assets"
                    fieldName="image_url"
                    initialUrl={promo.image_url ?? ""}
                    label="Gambar promo dan carousel (wajib)"
                    maxFileSizeMB={5}
                    helperText="Gunakan gambar 1600 x 900 px (rasio 16:9). Gambar akan dipotong agar pas di carousel Beranda."
                  />
                  <div className="admin-form-actions">
                    <label className="check-label"><input type="checkbox" name="is_active" defaultChecked={promo.is_active} /> Tampilkan di Beranda dan halaman Promo</label>
                    <button className="button button-secondary" type="submit">Simpan perubahan</button>
                  </div>
                </form>
                <form action={deletePromoCard} className="admin-delete-form">
                  <input type="hidden" name="id" value={promo.id} />
                  <ConfirmSubmitButton message={`Hapus promo "${promo.title}"?`}>
                    Hapus promo
                  </ConfirmSubmitButton>
                </form>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <section className="admin-state-panel">
          <h2>Belum ada promo tersimpan</h2>
          <p>Tambahkan promo di formulir atas. Promo aktif akan muncul pada halaman publik.</p>
        </section>
      )}
      {(promos?.length ?? 0) >= 200 ? <p className="admin-data-note">Daftar dibatasi hingga 200 promo.</p> : null}
    </main>
  );
}
