import Link from "next/link";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { requireAdmin } from "@/lib/admin";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, sku, ecer_price, is_active, stock_status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Gagal memuat produk admin: ${error.message}`);

  return (
    <main className="admin-page">
      <div className="admin-page-heading">
        <div><p className="section-eyebrow">Katalog</p><h1>Produk</h1></div>
        <Link className="button button-primary" href="/admin/products/new">Tambah produk</Link>
      </div>
      <AdminFeedback searchParams={params} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Produk</th><th>SKU</th><th>Harga ecer</th><th>Status stok</th><th>Publikasi</th><th>Aksi</th></tr></thead>
          <tbody>
            {(data ?? []).map((product) => (
              <tr key={product.id}>
                <td><strong>{product.name}</strong><small>/{product.slug}</small></td>
                <td>{product.sku}</td>
                <td>Rp{Number(product.ecer_price).toLocaleString("id-ID")}</td>
                <td>{product.stock_status}</td>
                <td>{product.is_active ? "Aktif" : "Draft"}</td>
                <td><Link className="admin-row-link" href={`/admin/products/${product.id}`}>Edit</Link></td>
              </tr>
            ))}
            {!data?.length ? <tr><td colSpan={6}>Belum ada produk. Tambahkan produk pertama setelah foto dan data harga siap.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <p className="form-help">Status stok pada website bukan jaminan ketersediaan stok fisik.</p>
    </main>
  );
}
