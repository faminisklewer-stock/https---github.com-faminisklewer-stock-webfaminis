import Link from "next/link";
import type { Metadata } from "next";
import { BrandSymbol } from "@/components/BrandSymbol";
import { CategoryCard } from "@/components/CategoryCard";
import { CustomerTestimonials } from "@/components/CustomerTestimonials";
import { HomePromoCarousel, type HomePromoSlide } from "@/components/HomePromoCarousel";
import { ProductCard } from "@/components/ProductCard";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { getCategories, getProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { getHomepageContent } from "@/lib/storefront-content";
import { siteUrl } from "@/lib/site";

const categoryOrder = ["daster", "mukena", "sarung", "gamis", "setelan", "kaftan", "sajadah", "baju-koko"];

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Grosir Mukena & Daster Solo | Faminis Barokah" },
  description:
    "Faminis Barokah, supplier mukena dan daster di Surakarta (Solo). Temukan pilihan ecer, grosir, dan fashion muslim untuk oleh-oleh dari Kota Solo.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Grosir Mukena & Daster Solo | Faminis Barokah",
    description:
      "Supplier mukena dan daster di Surakarta (Solo), melayani pembelian ecer dan grosir serta pilihan oleh-oleh dari Kota Solo.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Grosir Mukena & Daster Solo | Faminis Barokah",
    description:
      "Supplier mukena dan daster di Surakarta (Solo), melayani pembelian ecer dan grosir serta pilihan oleh-oleh dari Kota Solo.",
  },
};

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
  const [categories, settings, bestSellers, homepageContent] = await Promise.all([
    getCategories(),
    getSiteSettings(),
    getProducts({ bestSeller: true, limit: 8 }),
    getHomepageContent(),
  ]);
  if (homepageContent.slidesError) {
    console.error("Homepage carousel could not be loaded.", homepageContent.slidesError);
  }
  if (homepageContent.testimonialsError) {
    console.error("Homepage customer testimonials could not be loaded.", homepageContent.testimonialsError);
  }
  const promoSlides: HomePromoSlide[] = (homepageContent.slides ?? []).flatMap((promo) => promo.image_url
    ? [{
      id: promo.id,
      title: promo.title,
      imageUrl: promo.image_url,
    }]
    : []);
  const promoLoadState = homepageContent.slidesError ? "error" : "ready";
  const testimonials = homepageContent.testimonials ?? [];
  const testimonialsLoadState = homepageContent.testimonialsError ? "error" : "ready";

  const sortedCategories = [...categories].sort((first, second) => {
    const firstRank = categoryOrder.indexOf(first.slug);
    const secondRank = categoryOrder.indexOf(second.slug);
    return (firstRank === -1 ? categoryOrder.length : firstRank) - (secondRank === -1 ? categoryOrder.length : secondRank);
  });
  const socialProfiles = [
    settings?.instagram_url,
    settings?.tiktok_url,
    settings?.facebook_url,
  ].filter((profile): profile is string => Boolean(profile));
  const organization = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${siteUrl}#business`,
    name: "Faminis Barokah",
    url: siteUrl,
    description:
      "Supplier mukena dan daster di Surakarta (Solo), melayani pembelian ecer dan grosir.",
    ...(settings?.phone ? { telephone: settings.phone } : {}),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(settings?.shop_photo_url ? { image: settings.shop_photo_url } : {}),
    ...(settings?.google_maps_url ? { hasMap: settings.google_maps_url } : {}),
    ...(socialProfiles.length ? { sameAs: socialProfiles } : {}),
    address: settings?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressLocality: "Surakarta",
          addressRegion: "Jawa Tengah",
          addressCountry: "ID",
        }
      : {
          "@type": "PostalAddress",
          addressLocality: "Surakarta",
          addressRegion: "Jawa Tengah",
          addressCountry: "ID",
        },
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Faminis Barokah",
    url: siteUrl,
    inLanguage: "id-ID",
    publisher: { "@id": `${siteUrl}#business` },
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
              Temukan mukena dan daster ecer maupun grosir dari Faminis Barokah di
              Surakarta (Solo). Tersedia juga sarung, gamis, dan fashion muslim untuk
              pilihan oleh-oleh dari Kota Solo.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/produk">Lihat katalog</Link>
              <Link className="button button-secondary" href="/kontak">Hubungi kami</Link>
            </div>
          </div>

          <div className="showcase-photo" aria-label="Gambar utama Faminis Barokah">
            <HomePromoCarousel slides={promoSlides} loadState={promoLoadState} />
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

      <section className="home-latest-products home-best-sellers wrap" aria-labelledby="best-seller-title">
          <div className="section-heading">
            <h2 id="best-seller-title">Pilihan terlaris</h2>
            <Link href="/produk" className="text-link">Lihat seluruh katalog</Link>
          </div>
          {bestSellers.length ? (
            <div className="product-grid">
              {bestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <p className="inline-empty">Produk terlaris akan tampil setelah Admin menandai produk pada pengaturan katalog.</p>
          )}
      </section>

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

      <CustomerTestimonials testimonials={testimonials} loadState={testimonialsLoadState} />

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
    </>
  );
}
