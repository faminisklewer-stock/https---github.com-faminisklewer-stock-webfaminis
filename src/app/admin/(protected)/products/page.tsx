import Link from "next/link";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/admin";
import { formatRupiah } from "@/lib/format";
import { stockStatusLabels } from "@/lib/admin-labels";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const publication = params.publication === "active" || params.publication === "draft"
    ? params.publication
    : "all";
  let productsQuery = supabase.from("products")
    .select("id, name, slug, sku, ecer_price, is_active, stock_status, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false }).limit(100);
  if (query) productsQuery = productsQuery.ilike("name", `%${query}%`);
  if (publication !== "all") productsQuery = productsQuery.eq("is_active", publication === "active");
  const { data, error, count } = await productsQuery;
  if (error) throw new Error(`Gagal memuat produk admin: ${error.message}`);

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="Katalog"
        title="Produk"
        description="Perbarui harga, informasi stok, dan status tayang produk."
        actions={<Link className="button button-primary" href="/admin/products/new">Tambah produk</Link>}
      />
      <AdminFeedback searchParams={params} />
      <form className="admin-list-tools" method="get" role="search">
        <label className="field-label">Cari nama produk
          <input type="search" name="q" defaultValue={query} placeholder="Contoh: Daster ..." />
        </label>
        <label className="field-label">Tampilan
          <select name="publication" defaultValue={publication}>
            <option value="all">Semua status</option>
            <option value="active">Tayang di katalog</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <button className="button button-secondary" type="submit">Terapkan</button>
        {(query || publication !== "all") ? <Link className="text-link" href="/admin/products">Hapus filter</Link> : null}
        <span className="admin-list-count">{count ?? 0} produk ditemukan{(count ?? 0) >= 100 ? " (maksimal 100 ditampilkan)" : ""}</span>
      </form>
      {data?.length ? (
        <ul className="admin-record-list product-record-list">
          {data.map((product) => (
            <li className="admin-record" key={product.id}>
              <div className="admin-record-main">
                <p className="admin-record-kicker">{product.sku}</p>
                <h2>{product.name}</h2>
                <p className="admin-record-subtitle">/{product.slug}</p>
              </div>
              <div className="admin-record-facts">
                <div><span>Harga ecer</span><strong>{formatRupiah(Number(product.ecer_price))}</strong></div>
                <div><span>Kondisi stok</span><strong className={`admin-status stock-${product.stock_status.toLowerCase()}`}>{stockStatusLabels[product.stock_status]}</strong></div>
                <div><span>Publikasi</span><strong className={`admin-status ${product.is_active ? "status-active" : "status-inactive"}`}>{product.is_active ? "Tayang" : "Draft"}</strong></div>
              </div>
              <Link className="button button-secondary admin-record-action" href={`/admin/products/${product.id}`}>Edit produk</Link>
            </li>
          ))}
        </ul>
      ) : (
        <section className="admin-state-panel">
          <h2>{query || publication !== "all" ? "Produk tidak ditemukan" : "Belum ada produk"}</h2>
          <p>{query || publication !== "all" ? "Coba ubah kata kunci atau hapus filter." : "Tambahkan produk setelah informasi harga dan foto siap."}</p>
          {query || publication !== "all"
            ? <Link href="/admin/products" className="button button-secondary">Lihat semua produk</Link>
            : <Link href="/admin/products/new" className="button button-primary">Tambah produk</Link>}
        </section>
      )}
      <p className="form-help">Status stok pada website bukan jaminan ketersediaan stok fisik.</p>
    </main>
  );
}
