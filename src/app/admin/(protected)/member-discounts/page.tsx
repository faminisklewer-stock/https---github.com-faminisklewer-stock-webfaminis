import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { requireAdmin } from "@/lib/admin";
import { createMemberDiscount, deleteMemberDiscount, toggleMemberDiscount } from "@/app/admin/actions";
import type { Category, Product } from "@/types/database";

export default async function MemberDiscountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const [discounts, products, categories] = await Promise.all([
    supabase.from("member_discounts").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("id, name").order("name"),
    supabase.from("categories").select("id, name").order("name"),
  ]);
  if (discounts.error || products.error || categories.error) throw new Error("Gagal memuat aturan diskon member.");
  const productOptions = (products.data ?? []) as Pick<Product, "id" | "name">[];
  const categoryOptions = (categories.data ?? []) as Pick<Category, "id" | "name">[];

  return (
    <main className="admin-page">
      <div className="admin-page-heading"><div><p className="section-eyebrow">Promosi member</p><h1>Diskon member</h1></div></div>
      <AdminFeedback searchParams={params} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Nama diskon</th><th>Aturan</th><th>Periode</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {(discounts.data ?? []).map((discount) => (
              <tr key={discount.id}>
                <td>{discount.name}<small>Minimum Rp{Number(discount.minimum_purchase).toLocaleString("id-ID")}</small></td>
                <td>{discount.discount_type === "PERCENTAGE" ? `${discount.discount_value}%` : `Rp${Number(discount.discount_value).toLocaleString("id-ID")}`}</td>
                <td>{discount.start_at ? new Date(discount.start_at).toLocaleDateString("id-ID") : "Tanpa tanggal mulai"}<small>{discount.end_at ? new Date(discount.end_at).toLocaleDateString("id-ID") : "Tanpa tanggal akhir"}</small></td>
                <td>{discount.is_active ? "Aktif" : "Nonaktif"}</td>
                <td className="discount-actions">
                  <form action={toggleMemberDiscount}>
                    <input type="hidden" name="id" value={discount.id} />
                    <input type="hidden" name="active" value={discount.is_active ? "false" : "true"} />
                    <button className="admin-row-link" type="submit">{discount.is_active ? "Nonaktifkan" : "Aktifkan"}</button>
                  </form>
                  <form action={deleteMemberDiscount}>
                    <input type="hidden" name="id" value={discount.id} />
                    <button className="admin-row-link danger-link" type="submit">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
            {!discounts.data?.length ? <tr><td colSpan={5}>Belum ada aturan diskon member.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <section className="admin-panel">
        <h2>Tambah aturan diskon</h2>
        <form className="admin-form" action={createMemberDiscount}>
          <div className="field-grid">
            <label className="field-label">Nama diskon<input name="name" required minLength={2} maxLength={160} /></label>
            <label className="field-label">Jenis
              <select name="discount_type"><option value="PERCENTAGE">Persentase</option><option value="NOMINAL">Nominal</option></select>
            </label>
            <label className="field-label">Nilai<input name="discount_value" type="number" min="0.01" step="0.01" required /></label>
            <label className="field-label">Minimum pembelian<input name="minimum_purchase" type="number" min="0" step="1" defaultValue="0" required /></label>
            <label className="field-label">Produk tertentu, opsional
              <select name="product_id" defaultValue=""><option value="">Semua produk</option>{productOptions.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
            </label>
            <label className="field-label">Kategori tertentu, opsional
              <select name="category_id" defaultValue=""><option value="">Semua kategori</option>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
            </label>
            <label className="field-label">Mulai<input name="start_at" type="date" /></label>
            <label className="field-label">Berakhir<input name="end_at" type="date" /></label>
          </div>
          <label className="check-label"><input type="checkbox" name="is_active" /> Aktifkan langsung</label>
          <button type="submit" className="button button-primary">Simpan diskon</button>
        </form>
      </section>
      <p className="form-help">Satu diskon terbaik yang memenuhi syarat diterapkan per pesanan. Perhitungan dilakukan oleh database saat checkout.</p>
    </main>
  );
}
