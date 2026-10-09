import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  createHomeCarouselSlide,
  deleteHomeCarouselSlide,
  updateHomeCarouselSlide,
} from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";

export default async function AdminHomeCarouselPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data: slides, error } = await supabase.from("home_carousel_slides")
    .select("id, title, image_url, destination_url, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Admin homepage carousel slides could not be loaded.", error);
    return (
      <main className="admin-page">
        <AdminPageHeader
          eyebrow="Konten Beranda"
          title="Carousel Beranda"
          description="Kelola gambar yang tampil di carousel Beranda. Konten ini terpisah dari daftar Promo."
        />
        <section className="admin-state-panel" role="alert">
          <h2>Carousel Beranda belum dapat dimuat</h2>
          <p>Pastikan migrasi carousel Beranda sudah dijalankan di Supabase, lalu muat ulang halaman ini.</p>
          <form action="/admin/home-carousel" method="get">
            <button className="button button-secondary" type="submit">Muat ulang</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="Konten Beranda"
        title="Carousel Beranda"
        description="Kelola slide untuk dua carousel Beranda. Daftar ini terpisah dari menu Promo dan halaman /promo."
      />
      <AdminFeedback searchParams={params} />
      <section className="admin-settings-panel admin-promo-create">
        <form action={createHomeCarouselSlide} className="admin-form">
          <fieldset className="admin-form-section">
            <legend>Tambah slide Beranda</legend>
            <div className="field-grid">
              <label className="field-label">Judul slide<input name="title" required minLength={2} maxLength={160} /></label>
              <label className="field-label">Tautan tujuan HTTPS<input name="destination_url" type="url" placeholder="https://..." required /></label>
              <label className="field-label">Urutan tampil<input name="sort_order" type="number" defaultValue={0} min={-100000} max={100000} required /></label>
            </div>
            <ImageUploader
              bucket="site-assets"
              fieldName="image_url"
              label="Gambar carousel (wajib)"
              maxFileSizeMB={5}
              helperText="Gunakan gambar 1600 x 900 px (rasio 16:9). Gambar ini hanya dipakai pada carousel Beranda."
            />
            <div className="admin-form-actions">
              <label className="check-label"><input type="checkbox" name="is_active" defaultChecked /> Tampilkan di Beranda</label>
              <button className="button button-primary" type="submit">Tambah slide</button>
            </div>
          </fieldset>
        </form>
      </section>
      <div className="admin-list-intro">
        <strong>Slide Beranda tersimpan</strong>
        <span>{(slides ?? []).filter((slide) => slide.is_active).length} sedang ditampilkan</span>
      </div>
      {slides?.length ? (
        <div className="admin-edit-list admin-promo-list">
          {slides.map((slide) => (
            <details className="admin-promo-item" key={slide.id}>
              <summary>
                <span className="admin-category-title">{slide.title}</span>
                <span className={`admin-status ${slide.is_active ? "status-active" : "status-inactive"}`}>
                  {slide.is_active ? "Tayang" : "Disembunyikan"}
                </span>
                <span className="admin-expand-label">Kelola</span>
              </summary>
              <div className="admin-promo-editor">
                <form action={updateHomeCarouselSlide} className="admin-form">
                  <input type="hidden" name="id" value={slide.id} />
                  <div className="field-grid">
                    <label className="field-label">Judul slide<input name="title" defaultValue={slide.title} required minLength={2} maxLength={160} /></label>
                    <label className="field-label">Tautan tujuan HTTPS<input name="destination_url" type="url" defaultValue={slide.destination_url} required /></label>
                    <label className="field-label">Urutan tampil<input name="sort_order" type="number" defaultValue={slide.sort_order} min={-100000} max={100000} required /></label>
                  </div>
                  <ImageUploader
                    bucket="site-assets"
                    fieldName="image_url"
                    initialUrl={slide.image_url}
                    label="Gambar carousel (wajib)"
                    maxFileSizeMB={5}
                    helperText="Gunakan gambar 1600 x 900 px (rasio 16:9). Gambar ini hanya dipakai pada carousel Beranda."
                  />
                  <div className="admin-form-actions">
                    <label className="check-label"><input type="checkbox" name="is_active" defaultChecked={slide.is_active} /> Tampilkan di Beranda</label>
                    <button className="button button-secondary" type="submit">Simpan perubahan</button>
                  </div>
                </form>
                <form action={deleteHomeCarouselSlide} className="admin-delete-form">
                  <input type="hidden" name="id" value={slide.id} />
                  <ConfirmSubmitButton message={`Hapus slide "${slide.title}"?`}>
                    Hapus slide
                  </ConfirmSubmitButton>
                </form>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <section className="admin-state-panel">
          <h2>Belum ada slide Beranda</h2>
          <p>Tambahkan gambar melalui formulir di atas. Slide aktif akan muncul di kedua carousel pada Beranda.</p>
        </section>
      )}
      {(slides?.length ?? 0) >= 200 ? <p className="admin-data-note">Daftar dibatasi hingga 200 slide.</p> : null}
    </main>
  );
}
