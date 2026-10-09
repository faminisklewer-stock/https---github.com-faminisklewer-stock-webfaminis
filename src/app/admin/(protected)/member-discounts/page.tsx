import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { requireAdmin } from "@/lib/admin";
import { formatRupiah } from "@/lib/format";
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
      <AdminPageHeader
        eyebrow="Promosi member"
        title="Diskon member"
        description="Atur nilai, masa berlaku, dan cakupan potongan harga untuk member."
      />
      <AdminFeedback searchParams={params} />
      <div className="admin-list-intro">
        <strong>{discounts.data?.length ?? 0} aturan diskon</strong>
        <span>{discounts.data?.filter((discount) => discount.is_active).length ?? 0} berstatus aktif</span>
      </div>
      {discounts.data?.length ? (
        <div className="admin-record-list discount-record-list">
          {discounts.data.map((discount) => {
            const scope = discount.product_id
              ? `Produk: ${productOptions.find((product) => product.id === discount.product_id)?.name ?? "Produk tidak ditemukan"}`
              : discount.category_id
                ? `Kategori: ${categoryOptions.find((category) => category.id === discount.category_id)?.name ?? "Kategori tidak ditemukan"}`
                : "Semua produk";
            return (
              <article className="admin-record discount-record" key={discount.id}>
                <div className="admin-record-main">
                  <p className="admin-record-kicker">Aturan diskon member</p>
                  <h2>{discount.name}</h2>
                  <p className="admin-record-subtitle">{scope}</p>
                </div>
                <div className="discount-record-facts">
                  <div>
                    <span>Potongan</span>
                    <strong>{discount.discount_type === "PERCENTAGE" ? `${Number(discount.discount_value)}%` : formatRupiah(Number(discount.discount_value))}</strong>
                  </div>
                  <div><span>Minimum pembelian</span><strong>{formatRupiah(Number(discount.minimum_purchase))}</strong></div>
                  <div>
                    <span>Periode</span>
                    <strong>{discount.start_at ? new Date(discount.start_at).toLocaleDateString("id-ID") : "Tanpa tanggal mulai"}</strong>
                    <small>Sampai {discount.end_at ? new Date(discount.end_at).toLocaleDateString("id-ID") : "tanpa tanggal akhir"}</small>
                  </div>
                </div>
                <div className="discount-record-actions">
                  <strong className={`admin-status ${discount.is_active ? "status-active" : "status-inactive"}`}>
                    {discount.is_active ? "Aktif" : "Nonaktif"}
                  </strong>
                  <form action={toggleMemberDiscount}>
                    <input type="hidden" name="id" value={discount.id} />
                    <input type="hidden" name="active" value={discount.is_active ? "false" : "true"} />
                    <button className="button button-secondary button-compact" type="submit">
                      {discount.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                  <form action={deleteMemberDiscount}>
                    <input type="hidden" name="id" value={discount.id} />
                    <ConfirmSubmitButton message={`Hapus aturan diskon ${discount.name}?`}>Hapus</ConfirmSubmitButton>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="admin-state-panel">
          <h2>Belum ada aturan diskon</h2>
          <p>Buat aturan untuk menentukan potongan member berdasarkan nilai belanja atau produk tertentu.</p>
        </section>
      )}
      <details className="admin-creator" id="buat-diskon" open={!discounts.data?.length}>
        <summary>Buat aturan diskon</summary>
        <form className="admin-form" action={createMemberDiscount}>
          <div className="field-grid">
            <label className="field-label">Nama diskon<input name="name" required minLength={2} maxLength={160} /></label>
            <label className="field-label">Jenis potongan
              <select name="discount_type"><option value="PERCENTAGE">Persentase</option><option value="NOMINAL">Nominal rupiah</option></select>
            </label>
            <label className="field-label">Nilai potongan<input name="discount_value" type="number" min="0.01" step="0.01" required /></label>
            <label className="field-label">Minimum pembelian<input name="minimum_purchase" type="number" min="0" step="1" defaultValue="0" required /></label>
            <label className="field-label">Berlaku untuk produk
              <select name="product_id" defaultValue=""><option value="">Semua produk</option>{productOptions.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
            </label>
            <label className="field-label">Atau kategori
              <select name="category_id" defaultValue=""><option value="">Semua kategori</option>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
            </label>
            <label className="field-label">Mulai berlaku<input name="start_at" type="date" /></label>
            <label className="field-label">Berakhir<input name="end_at" type="date" /></label>
          </div>
          <p className="form-help">Pilih produk atau kategori saja, jangan keduanya. Jika keduanya kosong, aturan berlaku untuk semua produk.</p>
          <label className="check-label"><input type="checkbox" name="is_active" /> Aktifkan setelah disimpan</label>
          <button type="submit" className="button button-primary">Simpan aturan</button>
        </form>
      </details>
      <p className="form-help admin-data-note">Satu diskon terbaik yang memenuhi syarat diterapkan per pesanan. Perhitungan dilakukan oleh database saat checkout.</p>
    </main>
  );
}
