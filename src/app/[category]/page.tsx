import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { getCategoryBySlug, getProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategori tidak ditemukan", robots: { index: false, follow: false } };

  const title = category.seo_title || `${category.name} Ecer & Grosir`;
  const description = category.seo_description || category.description || `Lihat koleksi ${category.name} dari Faminis Barokah untuk kebutuhan ecer dan grosir. Konfirmasi stok kepada Admin sebelum pembayaran.`;
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
  const title = `${category.name} Ecer & Grosir`;
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
        <p>Harga grosir dan jumlah minimum dapat berbeda untuk tiap produk. Stok fisik selalu dikonfirmasi Admin sebelum pembayaran.</p>
      </header>
      <ProductGrid
        products={products}
        emptyTitle={`Belum ada produk ${category.name.toLocaleLowerCase("id-ID")}`}
        emptyDescription="Kategori ini belum memiliki produk aktif. Silakan kembali untuk melihat koleksi lainnya."
      />
      <div className="related-categories">
        <h2>Jelajahi katalog</h2>
        <Link href="/produk">Semua produk</Link>
        <Link href="/panduan-grosir">Panduan belanja grosir</Link>
        <Link href="/reseller">Program reseller</Link>
      </div>
    </div>
  );
}
