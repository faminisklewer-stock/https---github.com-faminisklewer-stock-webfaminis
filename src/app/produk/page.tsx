import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { siteUrl } from "@/lib/site";
import type { Product } from "@/types/database";

export const metadata: Metadata = {
  title: "Produk Fashion Muslim Ecer & Grosir",
  description: "Cari daster, mukena, gamis, sarung, dan fashion muslim Faminis Barokah. Pilih produk ecer atau tanyakan opsi grosir kepada Admin.",
  alternates: { canonical: "/produk" },
  openGraph: { title: "Produk Fashion Muslim Ecer & Grosir", description: "Jelajahi katalog produk Faminis Barokah.", url: `${siteUrl}/produk` },
  twitter: { card: "summary", title: "Produk Fashion Muslim Ecer & Grosir", description: "Jelajahi katalog produk Faminis Barokah." },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductListingPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categorySlug = first(params.kategori);
  const sort = first(params.urut);
  const min = Number(first(params.min));
  const max = Number(first(params.max));
  const stockValue = first(params.stok);
  const stockStatus = ["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK", "CONFIRM"].includes(stockValue ?? "")
    ? stockValue as Product["stock_status"]
    : undefined;
  const featuredForReseller = first(params.pilihan) === "reseller";

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug,
      sort,
      minPrice: Number.isFinite(min) && min > 0 ? min : undefined,
      maxPrice: Number.isFinite(max) && max > 0 ? max : undefined,
      stockStatus,
      featuredForReseller,
    }),
  ]);
  const selectedCategory = categories.find((category) => category.slug === categorySlug);

  return (
    <div className="page-wrap">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Beranda</Link><span>/</span><span>Produk</span>
      </nav>
      <div className="listing-heading">
        <div>
          <p className="section-eyebrow">Katalog Faminis Barokah</p>
          <h1>{selectedCategory ? selectedCategory.name : "Produk fashion muslim"}</h1>
          <p>Temukan produk ecer dan grosir. Ketersediaan stok akan dikonfirmasi Admin.</p>
        </div>
        <span className="result-count">{products.length} produk ditampilkan</span>
      </div>
      <form className="catalog-filters" action="/produk">
        <label>
          Kategori
          <select name="kategori" defaultValue={categorySlug ?? ""}>
            <option value="">Semua kategori</option>
            {categories.map((category) => <option value={category.slug} key={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label>
          Urutkan
          <select name="urut" defaultValue={sort ?? "terbaru"}>
            <option value="terbaru">Terbaru</option>
            <option value="terlaris">Terlaris</option>
            <option value="harga-termurah">Harga termurah</option>
            <option value="harga-tertinggi">Harga tertinggi</option>
            <option value="nama">Nama A-Z</option>
          </select>
        </label>
        <label>
          Harga minimum
          <input type="number" name="min" min="0" inputMode="numeric" defaultValue={first(params.min) ?? ""} />
        </label>
        <label>
          Harga maksimum
          <input type="number" name="max" min="0" inputMode="numeric" defaultValue={first(params.max) ?? ""} />
        </label>
        <label>
          Status katalog
          <select name="stok" defaultValue={stockValue ?? ""}>
            <option value="">Semua status</option>
            <option value="AVAILABLE">Tersedia menurut katalog</option>
            <option value="LOW_STOCK">Stok menipis</option>
            <option value="OUT_OF_STOCK">Habis</option>
            <option value="CONFIRM">Perlu konfirmasi</option>
          </select>
        </label>
        <button className="button button-primary" type="submit">Terapkan filter</button>
      </form>
      <ProductGrid
        products={products}
        emptyTitle="Belum ada produk yang cocok"
        emptyDescription="Ubah kata pencarian atau filter. Jika produk belum tampil, Admin mungkin belum mengaktifkan katalog."
      />
    </div>
  );
}
