import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { requireAdmin } from "@/lib/admin";
import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data, error } = await supabase.from("categories")
    .select("id, name, slug, description, image_url, seo_title, seo_description, is_active")
    .order("name");
  if (error) throw new Error(`Gagal memuat kategori admin: ${error.message}`);
  const categories = data ?? [];

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="Katalog"
        title="Kategori"
        description="Atur kelompok produk yang pelanggan gunakan untuk menjelajahi katalog."
      />
      <AdminFeedback searchParams={params} />
      <div className="admin-list-intro">
        <strong>{categories.length} kategori</strong>
        <span>{categories.filter((category) => category.is_active).length} ditampilkan di katalog</span>
      </div>
      {categories.length ? (
        <div className="admin-edit-list admin-category-list">
          {categories.map((category) => (
            <details className="admin-category-item" key={category.id}>
              <summary>
                <span className="admin-category-title">{category.name}</span>
                <span className="admin-category-slug">/{category.slug}</span>
                <span className={`admin-status ${category.is_active ? "status-active" : "status-inactive"}`}>
                  {category.is_active ? "Tayang" : "Disembunyikan"}
                </span>
                <span className="admin-expand-label">Kelola</span>
              </summary>
              <div className="admin-category-editor">
                <form action={updateCategory} className="admin-form">
                  <input type="hidden" name="id" value={category.id} />
                  <div className="field-grid">
                    <label className="field-label">Nama<input name="name" defaultValue={category.name} required maxLength={120} /></label>
                    <label className="field-label">Slug<input name="slug" defaultValue={category.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
                  </div>
                  <label className="field-label">Deskripsi<textarea name="description" defaultValue={category.description ?? ""} maxLength={1000} /></label>
                  <ImageUploader bucket="category-images" initialUrl={category.image_url ?? ""} />
                  <details className="admin-form-section admin-optional-section">
                    <summary>Pengaturan SEO (opsional)</summary>
                    <div className="admin-form">
                      <label className="field-label">SEO title<input name="seo_title" defaultValue={category.seo_title ?? ""} maxLength={180} /></label>
                      <label className="field-label">Meta description<textarea name="seo_description" defaultValue={category.seo_description ?? ""} maxLength={320} /></label>
                    </div>
                  </details>
                  <div className="admin-form-actions">
                    <label className="check-label"><input type="checkbox" name="is_active" defaultChecked={category.is_active} /> Tampilkan di katalog</label>
                    <button className="button button-secondary" type="submit">Simpan kategori</button>
                  </div>
                </form>
                <form action={deleteCategory} className="admin-delete-form">
                  <input type="hidden" name="id" value={category.id} />
                  <ConfirmSubmitButton message={`Hapus kategori ${category.name}? Pastikan kategori ini tidak lagi digunakan.`}>
                    Hapus kategori
                  </ConfirmSubmitButton>
                </form>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <section className="admin-state-panel">
          <h2>Belum ada kategori</h2>
          <p>Tambahkan kategori agar produk dapat dikelompokkan dan pelanggan lebih mudah menjelajah.</p>
        </section>
      )}
      <details className="admin-creator" id="tambah-kategori" open={!categories.length}>
        <summary>Tambah kategori baru</summary>
        <form action={createCategory} className="admin-form">
          <div className="field-grid">
            <label className="field-label">Nama<input name="name" required minLength={2} maxLength={120} /></label>
            <label className="field-label">Slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="contoh-kategori" /></label>
          </div>
          <label className="field-label">Deskripsi<textarea name="description" maxLength={1000} /></label>
          <ImageUploader bucket="category-images" />
          <details className="admin-form-section admin-optional-section">
            <summary>Pengaturan SEO (opsional)</summary>
            <div className="admin-form">
              <label className="field-label">SEO title<input name="seo_title" maxLength={180} /></label>
              <label className="field-label">Meta description<textarea name="seo_description" maxLength={320} /></label>
            </div>
          </details>
          <label className="check-label"><input type="checkbox" name="is_active" defaultChecked /> Tampilkan di katalog</label>
          <button className="button button-primary" type="submit">Tambah kategori</button>
        </form>
      </details>
    </main>
  );
}
