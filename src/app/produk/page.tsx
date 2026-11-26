import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icons";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Katalog Grosir Mukena & Daster Solo",
  description:
    "Jelajahi katalog supplier mukena dan daster Faminis Barokah di Solo. Pilih produk ecer atau grosir, lalu konfirmasi harga dan stok kepada Admin.",
  alternates: { canonical: "/produk" },
  openGraph: {
    title: "Katalog Grosir Mukena & Daster Solo | Faminis Barokah",
    description:
      "Jelajahi katalog supplier mukena dan daster Faminis Barokah di Solo untuk pembelian ecer maupun grosir.",
    url: `${siteUrl}/produk`,
  },
  twitter: {
    card: "summary",
    title: "Katalog Grosir Mukena & Daster Solo | Faminis Barokah",
    description:
      "Jelajahi katalog supplier mukena dan daster Faminis Barokah di Solo untuk pembelian ecer maupun grosir.",
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductListingPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categorySlug = first(params.kategori);
  const searchTerm = first(params.q)?.trim() ?? "";

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug,
      search: searchTerm || undefined,
    }),
  ]);
  const selectedCategory = categories.find((category) => category.slug === categorySlug);
  const categoryLink = (slug?: string) => {
    const query = new URLSearchParams();
    if (slug) query.set("kategori", slug);
    if (searchTerm) query.set("q", searchTerm);
    const queryString = query.toString();
    return queryString ? `/produk?${queryString}` : "/produk";
  };

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
      <div className="catalog-controls">
        <form className="catalog-search" action="/produk" role="search">
          {categorySlug ? <input type="hidden" name="kategori" value={categorySlug} /> : null}
          <Icon name="search" className="catalog-search-icon" />
          <label className="sr-only" htmlFor="catalog-search-input">Cari di katalog</label>
          <input
            id="catalog-search-input"
            type="search"
            name="q"
            defaultValue={searchTerm}
            placeholder="Cari produk, kategori, atau motif..."
          />
          <button className="button button-primary" type="submit">Cari</button>
        </form>
        <nav className="catalog-category-filters" aria-label="Filter berdasarkan kategori">
          <Link
            className={`catalog-category-chip${!categorySlug ? " is-selected" : ""}`}
            href={categoryLink()}
            aria-current={!categorySlug ? "page" : undefined}
          >
            Semua kategori
          </Link>
          {categories.map((category) => (
            <Link
              className={`catalog-category-chip${categorySlug === category.slug ? " is-selected" : ""}`}
              href={categoryLink(category.slug)}
              aria-current={categorySlug === category.slug ? "page" : undefined}
              key={category.id}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
      <ProductGrid
        products={products}
        emptyTitle={searchTerm ? "Produk tidak ditemukan" : "Belum ada produk di kategori ini"}
        emptyDescription={searchTerm ? "Coba kata pencarian lain atau pilih kategori berbeda." : "Admin dapat mengaktifkan produk untuk kategori ini melalui panel Admin."}
      />
    </div>
  );
}
