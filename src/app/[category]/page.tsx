import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { getCategoryBySlug, getProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

const localCategorySeo: Record<string, { title: string; description: string; content: string }> = {
  mukena: {
    title: "Grosir Mukena Solo",
    description:
      "Cari supplier mukena di Solo? Faminis Barokah menyediakan pilihan mukena ecer dan grosir. Periksa harga, jumlah minimum, dan stok pada katalog.",
    content:
      "Faminis Barokah melayani pembelian mukena ecer dan grosir di Surakarta (Solo). Periksa jumlah minimum per produk dan konfirmasi stok kepada Admin.",
  },
  daster: {
    title: "Grosir Daster Solo",
    description:
      "Cari supplier daster di Solo? Faminis Barokah menyediakan pilihan daster ecer dan grosir. Periksa harga, jumlah minimum, dan stok pada katalog.",
    content:
      "Faminis Barokah melayani pembelian daster ecer dan grosir di Surakarta (Solo). Periksa jumlah minimum per produk dan konfirmasi stok kepada Admin.",
  },
};

function getCategoryTitle(category: { name: string; slug: string }) {
  return localCategorySeo[category.slug]?.title ?? `${category.name} Ecer & Grosir`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategori tidak ditemukan", robots: { index: false, follow: false } };

  const localSeo = localCategorySeo[category.slug];
  const title = category.seo_title || getCategoryTitle(category);
  const description = category.seo_description
    || localSeo?.description
    || category.description
    || `Lihat koleksi ${category.name} dari Faminis Barokah untuk kebutuhan ecer dan grosir. Konfirmasi stok kepada Admin sebelum pembayaran.`;
  return {
    title,
    description,
    alternates: { canonical: `/${category.slug}` },
    openGraph: { title, description, url: `${siteUrl}/${category.slug}`, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getProducts({ categorySlug: slug });
  const localSeo = localCategorySeo[category.slug];
  const title = getCategoryTitle(category);
  const description = category.description || `Jelajahi pilihan ${category.name} Faminis Barokah. Tanyakan stok, motif, warna, dan ukuran sebelum melakukan pembayaran.`;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: `${siteUrl}/${slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        { "@type": "ListItem", position: 2, name: category.name, item: `${siteUrl}/${slug}` },
      ],
    },
  ];

  return (
    <div className="page-wrap">
      <SeoJsonLd data={schema} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Beranda</Link><span>/</span><span>{category.name}</span>
      </nav>
      <header className="category-intro">
        <p className="section-eyebrow">Kategori Faminis Barokah</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {localSeo ? <p>{localSeo.content}</p> : null}
        <p>Harga grosir dan jumlah minimum dapat berbeda untuk tiap produk. Stok fisik selalu dikonfirmasi Admin sebelum pembayaran.</p>
      </header>
      <ProductGrid
        products={products}
        emptyTitle={`Belum ada produk ${category.name.toLocaleLowerCase("id-ID")}`}
        emptyDescription="Kategori ini belum memiliki produk aktif. Silakan kembali untuk melihat koleksi lainnya."
      />
      <div className="related-categories">
        <h2>Kategori lain</h2>
        <Link href="/produk">Semua produk</Link>
        <Link href="/reseller">Program reseller</Link>
      </div>
    </div>
  );
}
