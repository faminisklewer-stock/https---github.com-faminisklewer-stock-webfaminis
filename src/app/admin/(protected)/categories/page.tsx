import { AdminFeedback } from "@/components/admin/AdminFeedback";
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

  return (
    <main className="admin-page">
      <div className="admin-page-heading"><div><p className="section-eyebrow">Katalog</p><h1>Kategori</h1></div></div>
      <AdminFeedback searchParams={params} />
      <div className="admin-edit-list">
        {(data ?? []).map((category) => (
          <section className="admin-panel" key={category.id}>
            <form action={updateCategory} className="admin-form">
              <input type="hidden" name="id" value={category.id} />
              <div className="field-grid">
                <label className="field-label">Nama<input name="name" defaultValue={category.name} required maxLength={120} /></label>
                <label className="field-label">Slug<input name="slug" defaultValue={category.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
              </div>
              <label className="field-label">Deskripsi<textarea name="description" defaultValue={category.description ?? ""} maxLength={1000} /></label>
              <ImageUploader bucket="category-images" initialUrl={category.image_url ?? ""} />
              <label className="field-label">SEO title<input name="seo_title" defaultValue={category.seo_title ?? ""} maxLength={180} /></label>
              <label className="field-label">Meta description<textarea name="seo_description" defaultValue={category.seo_description ?? ""} maxLength={320} /></label>
              <div className="admin-form-actions">
                <label className="check-label"><input type="checkbox" name="is_active" defaultChecked={category.is_active} /> Aktif</label>
                <button className="button button-secondary" type="submit">Simpan kategori</button>
              </div>
            </form>
            <form action={deleteCategory} className="admin-delete-form">
              <input type="hidden" name="id" value={category.id} />
              <button className="admin-row-link danger-link" type="submit">Hapus kategori</button>
            </form>
          </section>
        ))}
      </div>
      <section className="admin-panel">
        <h2>Tambah kategori</h2>
        <form action={createCategory} className="admin-form">
          <div className="field-grid">
            <label className="field-label">Nama<input name="name" required minLength={2} maxLength={120} /></label>
            <label className="field-label">Slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
          </div>
          <label className="field-label">Deskripsi<textarea name="description" maxLength={1000} /></label>
          <ImageUploader bucket="category-images" />
          <label className="field-label">SEO title<input name="seo_title" maxLength={180} /></label>
          <label className="field-label">Meta description<textarea name="seo_description" maxLength={320} /></label>
          <label className="check-label"><input type="checkbox" name="is_active" defaultChecked /> Tampilkan di katalog</label>
          <button className="button button-primary" type="submit">Tambah kategori</button>
        </form>
      </section>
    </main>
  );
}
