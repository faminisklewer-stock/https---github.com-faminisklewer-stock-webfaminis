import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Cari Produk",
  description: "Cari produk fashion muslim di katalog Faminis Barokah.",
  robots: { index: false, follow: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().slice(0, 100);
  const products = query ? await getProducts({ search: query }) : [];

  return (
    <div className="page-wrap">
      <p className="section-eyebrow">Pencarian produk</p>
      <h1>{query ? `Hasil untuk “${query}”` : "Cari produk"}</h1>
      <div className="search-page-form"><SearchBar initialValue={query} /></div>
      {query ? (
        <ProductGrid products={products} emptyTitle="Produk tidak ditemukan" emptyDescription="Coba kata kunci lain atau cari berdasarkan nama kategori." />
      ) : (
        <p className="inline-empty">Masukkan nama produk, SKU, atau kategori untuk mulai mencari.</p>
      )}
    </div>
  );
}
