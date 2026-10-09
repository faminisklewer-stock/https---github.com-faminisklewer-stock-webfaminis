import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { BrandSymbol } from "@/components/BrandSymbol";
import { CategoryCard } from "@/components/CategoryCard";
import { HomeProductCarousel } from "@/components/HomeProductCarousel";
import { ProductGrid } from "@/components/ProductGrid";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { SectionHeading } from "@/components/SectionHeading";
import { getCategories, getProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { siteUrl } from "@/lib/site";

const categoryOrder = ["daster", "mukena", "sarung", "gamis", "setelan", "kaftan", "sajadah", "baju-koko"];

function productPhoto(products: CatalogProduct[]) {
  return products.find((product) => !product.isSample && product.product_images[0]);
}

function BenefitIcon({ type }: { type: "garment" | "price" | "stock" | "support" }) {
  const paths = {
    garment: <><path d="m8 4 4 2 4-2 4 3-2 4-2-1v10H8V10l-2 1-2-4 4-3Z" /><path d="M9 6.5c.7 1.4 1.7 2 3 2s2.3-.6 3-2" /></>,
    price: <><path d="M4 12 12 4h7v7l-8 8-7-7Z" /><circle cx="15.5" cy="8.5" r="1" /></>,
    stock: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v8.5" /></>,
    support: <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><path d="M4 13h3v6H5a1 1 0 0 1-1-1v-5Zm16 0h-3v6h2a1 1 0 0 0 1-1v-5Z" /><path d="M17 19a5 5 0 0 1-5 2" /></>,
  };

  return (
    <svg className="hero-benefit-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[type]}
    </svg>
  );
}

export default async function HomePage() {
  const [categories, newest, bestSellers, featured, settings] = await Promise.all([
    getCategories(),
    getProducts({ limit: 6 }),
    getProducts({ bestSeller: true, sort: "terlaris", limit: 6 }),
    getProducts({ featured: true, limit: 6 }),
    getSiteSettings(),
  ]);

  const sortedCategories = [...categories].sort((first, second) => {
    const firstRank = categoryOrder.indexOf(first.slug);
    const secondRank = categoryOrder.indexOf(second.slug);
    return (firstRank === -1 ? categoryOrder.length : firstRank) - (secondRank === -1 ? categoryOrder.length : secondRank);
  });
  const heroProduct = productPhoto(newest);
  const latestProductSlides = newest.flatMap((product) => {
    const image = product.product_images[0];
    return !product.isSample && image
      ? [{
        slug: product.slug,
        name: product.name,
        imageUrl: image.image_url,
        imageAlt: image.alt_text || product.name,
      }]
      : [];
  });

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Faminis Barokah",
    url: siteUrl,
    address: settings?.address
      ? { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: "Surakarta", addressCountry: "ID" }
      : { "@type": "PostalAddress", addressLocality: "Surakarta", addressCountry: "ID" },
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Faminis Barokah",
    url: siteUrl,
    inLanguage: "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/cari?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <SeoJsonLd data={[organization, website]} />
      <section className="showcase-hero wrap" aria-labelledby="hero-title">
        <div className="showcase-copy">
          <p className="hero-kicker">Faminis Barokah</p>
          <h1 id="hero-title">Pusat Grosir &amp; Ecer Fashion Muslim</h1>
          <p className="hero-description">
            Daster, mukena, sarung, gamis, dan beragam produk fashion muslim lainnya
            untuk kebutuhan pribadi maupun usaha.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/produk">Lihat katalog</Link>
            <Link className="button button-secondary" href="/kontak">Hubungi kami</Link>
          </div>
        </div>

        <div className="showcase-photo" aria-label="Foto produk Faminis Barokah">
          {heroProduct?.product_images[0] ? (
            <Link href={`/produk/${heroProduct.slug}`} aria-label={`Lihat ${heroProduct.name}`}>
              <Image
                src={heroProduct.product_images[0].image_url}
                alt={heroProduct.product_images[0].alt_text || heroProduct.name}
                fill
                priority
                sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 600px"
              />
            </Link>
          ) : (
            <div className="showcase-photo-placeholder">
              <span>Foto produk Faminis</span>
              <small>Unggah foto produk di panel admin untuk menampilkannya di sini.</small>
            </div>
          )}
        </div>

        <ul className="hero-benefits" aria-label="Cara belanja di Faminis Barokah">
          <li><BenefitIcon type="garment" /><span><strong>Ecer maupun grosir</strong><small>Pilih sesuai kebutuhan</small></span></li>
          <li><BenefitIcon type="price" /><span><strong>Harga jelas</strong><small>Rincian harga di setiap produk</small></span></li>
          <li><BenefitIcon type="stock" /><span><strong>Stok dikonfirmasi</strong><small>Admin mengecek sebelum pesanan</small></span></li>
          <li><BenefitIcon type="support" /><span><strong>Pesan lewat keranjang</strong><small>Kirim permintaan pesanan melalui WhatsApp</small></span></li>
        </ul>
      </section>

      <section className="home-category-section wrap" aria-labelledby="category-title">
        <h2 className="sr-only" id="category-title">Belanja berdasarkan kategori</h2>
        {sortedCategories.length ? (
          <div className="home-category-row">
            {sortedCategories.slice(0, 6).map((category) => (
              <CategoryCard category={category} key={category.id} />
            ))}
            <Link href="/produk" className="category-all-link">Lihat semua kategori</Link>
          </div>
        ) : (
          <p className="inline-empty">Kategori akan tampil setelah Admin mengaktifkannya.</p>
        )}
      </section>

      <section className="home-product-showcase wrap" aria-labelledby="newest-title">
        <aside className="home-promo-card">
          <div className="home-promo-copy">
            <p className="section-eyebrow">Promo</p>
            <h2>Promo dan komunitas reseller</h2>
            <p>Lihat informasi TikTok Live dan grup reseller Faminis.</p>
            <Link href="/promo" className="button button-primary">Lihat promo</Link>
          </div>
        </aside>

        <div className="home-latest-products">
          <SectionHeading id="newest-title" title="Produk terbaru" href="/produk" />
          <HomeProductCarousel slides={latestProductSlides} />
        </div>
      </section>

      {bestSellers.length ? (
        <section className="product-section section-wrap" aria-labelledby="best-title">
          <div className="wrap">
            <SectionHeading id="best-title" title="Produk populer" href="/produk?urut=terlaris" />
            <ProductGrid products={bestSellers} />
          </div>
        </section>
      ) : null}

      {featured.length ? (
        <section className="product-section section-wrap product-section-tint" aria-labelledby="featured-title">
          <div className="wrap">
            <SectionHeading id="featured-title" title="Pilihan untuk reseller" href="/produk?pilihan=reseller" />
            <ProductGrid products={featured} />
          </div>
        </section>
      ) : null}

      <section className="order-flow section-wrap" aria-labelledby="order-flow-title">
        <div className="wrap order-flow-inner">
          <div>
            <p className="section-eyebrow">Alur pemesanan</p>
            <h2 id="order-flow-title">Dari katalog sampai konfirmasi Admin.</h2>
          </div>
          <ol className="order-flow-list">
            <li><span className="order-step-number">01</span><strong>Pilih produk</strong><span>Tambahkan produk dan varian yang diinginkan ke keranjang.</span></li>
            <li><span className="order-step-number">02</span><strong>Kirim pesanan</strong><span>Isi data penerima saat checkout, lalu lanjutkan ke WhatsApp.</span></li>
            <li><span className="order-step-number">03</span><strong>Tunggu konfirmasi</strong><span>Admin memeriksa stok, total akhir, dan instruksi pembayaran.</span></li>
          </ol>
        </div>
      </section>

      <section className="faq-section section-wrap" id="faq" aria-labelledby="faq-title">
        <div className="wrap faq-layout">
          <aside className="faq-brand" aria-label="Faminis Barokah">
            <BrandSymbol className="faq-brand-symbol" />
            <span>Faminis <b>Barokah</b></span>
            <small>Grosir &amp; Ecer Fashion Muslim</small>
          </aside>
          <div className="faq-content">
            <div className="faq-heading">
              <p className="section-eyebrow">Pertanyaan umum</p>
              <h2 id="faq-title">Sebelum memesan</h2>
            </div>
            <div className="faq-list">
              <details>
                <summary>Apakah bisa membeli satuan?</summary>
                <p>Bisa. Harga ecer tercantum pada produk yang tersedia di katalog.</p>
              </details>
              <details>
                <summary>Bagaimana mengetahui syarat harga grosir?</summary>
                <p>Periksa harga grosir dan jumlah minimum pada detail produk. Jika belum tercantum, tanyakan kepada Admin.</p>
              </details>
              <details>
                <summary>Apakah stok di katalog pasti tersedia?</summary>
                <p>Belum tentu. Admin akan memeriksa stok, motif, warna, dan ukuran sebelum pesanan diproses.</p>
              </details>
              <details>
                <summary>Kapan saya perlu membayar?</summary>
                <p>Tunggu konfirmasi stok, total akhir, serta instruksi pembayaran dari Admin setelah mengirim permintaan pesanan.</p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-band section-wrap" aria-labelledby="contact-title">
        <div className="wrap contact-inner">
          <div>
            <p className="section-eyebrow">Perlu bantuan?</p>
            <h2 id="contact-title">Tanyakan produk dan ketersediaannya kepada Admin.</h2>
          </div>
          <Link className="button button-primary" href="/kontak">Lihat informasi kontak</Link>
        </div>
      </section>
    </>
  );
}
