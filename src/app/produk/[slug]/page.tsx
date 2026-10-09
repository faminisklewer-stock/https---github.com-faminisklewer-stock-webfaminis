import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPurchasePanel } from "@/components/cart/ProductPurchasePanel";
import { ShareProductButton } from "@/components/ShareProductButton";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { StockNotice } from "@/components/StockNotice";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getProductBySlug } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan", robots: { index: false, follow: false } };

  const title = product.seo_title || product.name;
  const description = product.seo_description || product.short_description || `${product.name} dari Faminis Barokah. Tanyakan ketersediaan stok dan pilihan varian kepada Admin sebelum pembayaran.`;
  const url = product.canonical_url || `${siteUrl}/produk/${product.slug}`;
  const socialImage = product.og_image || product.product_images[0]?.image_url;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", images: socialImage ? [socialImage] : undefined },
    twitter: { card: socialImage ? "summary_large_image" : "summary", title, description, images: socialImage ? [socialImage] : undefined },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) notFound();

  const categoryUrl = `${siteUrl}/${product.categories?.slug ?? "produk"}`;
  const productUrl = `${siteUrl}/produk/${product.slug}`;
  const stockLabel = {
    AVAILABLE: "Tersedia menurut katalog",
    LOW_STOCK: "Stok menipis menurut katalog",
    OUT_OF_STOCK: "Habis menurut katalog",
    CONFIRM: "Stok perlu dikonfirmasi",
  }[product.stock_status];
  const stockMessage = `Halo Admin Faminis Barokah,\n\nSaya ingin menanyakan ketersediaan stok:\n\nProduk: ${product.name}\nSKU: ${product.sku}\n\nApakah stok produk tersebut masih tersedia?\n\nTerima kasih.`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.seo_description || product.short_description || product.description || product.name,
      sku: product.sku,
      brand: { "@type": "Brand", name: "Faminis Barokah" },
      image: product.product_images.map((image) => image.image_url),
      offers: {
        "@type": "Offer",
        priceCurrency: "IDR",
        price: product.ecer_price,
        url: productUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        { "@type": "ListItem", position: 2, name: product.categories?.name ?? "Produk", item: categoryUrl },
        { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
      ],
    },
  ];
  const mainImage = product.product_images[0];

  return (
    <div className="page-wrap product-detail-page">
      <SeoJsonLd data={schema} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Beranda</Link><span>/</span>
        <Link href={categoryUrl}>{product.categories?.name ?? "Produk"}</Link><span>/</span>
        <span>{product.name}</span>
      </nav>
      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="product-main-image">
            {mainImage ? (
              <Image
                src={mainImage.image_url}
                alt={mainImage.alt_text || product.name}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 55vw"
              />
            ) : (
              <div className="image-placeholder detail-placeholder">
                <span>Foto produk</span>
                <small>Belum diunggah oleh Admin</small>
              </div>
            )}
          </div>
          {product.product_images.length > 1 ? (
            <div className="product-thumbnails">
              {product.product_images.slice(1).map((image) => (
                <div className="product-thumbnail" key={image.id}>
                  <Image src={image.image_url} alt={image.alt_text || product.name} fill sizes="100px" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="product-detail-copy">
          <Link className="product-category" href={categoryUrl}>{product.categories?.name ?? "Fashion Muslim"}</Link>
          <h1>{product.name}</h1>
          <p className="product-sku">SKU: {product.sku}</p>
          {product.isSample ? <p className="product-sample-label">Produk contoh</p> : null}
          <div className="detail-price">
            <span>{product.isSample ? "Harga ecer (contoh)" : "Harga ecer mulai"}</span>
            <strong>{formatRupiah(product.ecer_price)}</strong>
          </div>
          {product.grosir_price !== null ? (
            <div className="wholesale-price">
              <span>{product.isSample ? "Harga grosir (contoh)" : "Harga grosir"}</span>
              <strong>{formatRupiah(product.grosir_price)}</strong>
              <small>Minimum {product.grosir_min_qty} item, konfirmasi kembali kepada Admin.</small>
            </div>
          ) : null}
          <p className="detail-stock">{stockLabel}. Status katalog bukan jaminan stok fisik.</p>
          <ProductPurchasePanel
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              ecerPrice: product.ecer_price,
              imageUrl: mainImage?.image_url ?? null,
            }}
            variants={product.product_variants}
            grosirPrice={product.grosir_price}
            grosirMinQty={product.grosir_min_qty}
            isSample={product.isSample}
          />
          <StockNotice />
          <WhatsAppButton
            number={settings?.whatsapp_admin_number}
            message={stockMessage}
            label="Tanya Stok via WhatsApp"
            className="button-secondary button-wide"
          />
          <ShareProductButton name={product.name} url={productUrl} />
          <section className="product-description">
            <h2>Deskripsi produk</h2>
            {product.description ? <p>{product.description}</p> : <p>Informasi produk belum ditambahkan. Tanyakan detail bahan, motif, ukuran, dan warna kepada Admin.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
