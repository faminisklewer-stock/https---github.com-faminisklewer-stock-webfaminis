import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductGrid } from "@/components/ProductGrid";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { SectionHeading } from "@/components/SectionHeading";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getCategories, getProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { siteUrl } from "@/lib/site";

export default async function HomePage() {
  const [categories, newest, bestSellers, featured, settings] = await Promise.all([
    getCategories(),
    getProducts({ limit: 8 }),
    getProducts({ bestSeller: true, sort: "terlaris", limit: 8 }),
    getProducts({ featured: true, limit: 8 }),
    getSiteSettings(),
  ]);

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
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="hero-kicker">Supplier fashion muslim, Surakarta</p>
          <h1 id="hero-title">Fashion Muslim untuk <em>ecer & grosir</em></h1>
          <p className="hero-description">
            Temukan daster, mukena, gamis, sarung, dan pilihan fashion muslim
            untuk kebutuhan pribadi maupun usaha.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/produk">Lihat koleksi</Link>
            <Link className="button button-secondary" href="/panduan-grosir">Belanja grosir</Link>
          </div>
          <p className="hero-assurance">Belanja ecer tetap bisa. Akun tidak wajib.</p>
        </div>
        <div className="hero-choices" aria-label="Pilihan belanja">
          <div className="hero-choices-heading">
            <span>FAMINIS BAROKAH</span>
            <span className="hero-stitch" aria-hidden="true" />
            <h2>Pilih cara belanja yang pas</h2>
          </div>
          <Link href="/produk" className="hero-choice">
            <span className="choice-index">01</span>
            <span><strong>Belanja ecer</strong><small>Untuk kebutuhan sendiri atau keluarga</small></span>
            <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/panduan-grosir" className="hero-choice">
            <span className="choice-index">02</span>
            <span><strong>Belanja grosir</strong><small>Pilihan untuk toko dan pembelian jumlah banyak</small></span>
            <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/reseller" className="hero-choice">
            <span className="choice-index">03</span>
            <span><strong>Mulai jadi reseller</strong><small>Lihat program dan benefit yang tersedia</small></span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="category-section section-wrap" aria-labelledby="category-title">
        <div className="wrap">
          <SectionHeading id="category-title" eyebrow="Temukan yang dicari" title="Belanja berdasarkan kategori" href="/produk" linkLabel="Semua produk" />
          {categories.length ? (
            <div className="category-grid">
              {categories.slice(0, 8).map((category) => (
                <CategoryCard category={category} key={category.id} />
              ))}
            </div>
          ) : (
            <p className="inline-empty">Kategori akan tampil setelah database Supabase disiapkan.</p>
          )}
        </div>
      </section>

      <section className="wholesale-band" aria-labelledby="wholesale-title">
        <div className="wrap wholesale-inner">
          <div>
            <p className="section-eyebrow">Untuk toko dan reseller</p>
            <h2 id="wholesale-title">Cari produk untuk dijual kembali?</h2>
            <p>Periksa syarat minimum grosir pada produk dan tanyakan ketersediaannya sebelum memesan.</p>
          </div>
          <Link className="button button-light" href="/reseller">Lihat program reseller</Link>
        </div>
      </section>

      <section className="product-section section-wrap" aria-labelledby="newest-title">
        <div className="wrap">
          <SectionHeading id="newest-title" eyebrow="Katalog Faminis" title="Produk terbaru" href="/produk" />
          {newest.length ? (
            <ProductGrid products={newest} />
          ) : (
            <ProductGrid
              products={[]}
              emptyTitle="Katalog sedang disiapkan"
              emptyDescription="Belum ada produk aktif. Admin dapat menambahkan produk dari panel pengelola setelah Supabase terhubung."
            />
          )}
        </div>
      </section>

      {bestSellers.length ? (
        <section className="product-section section-wrap product-section-tint" aria-labelledby="best-title">
          <div className="wrap">
            <SectionHeading id="best-title" eyebrow="Pilihan pelanggan" title="Produk terlaris" href="/produk?urut=terlaris" />
            <ProductGrid products={bestSellers} />
          </div>
        </section>
      ) : null}

      {featured.length ? (
        <section className="product-section section-wrap" aria-labelledby="featured-title">
          <div className="wrap">
            <SectionHeading id="featured-title" eyebrow="Pilihan Faminis" title="Produk pilihan" href="/produk?pilihan=reseller" />
            <ProductGrid products={featured} />
          </div>
        </section>
      ) : null}

      <section className="reassurance-section section-wrap" aria-labelledby="reassurance-title">
        <div className="wrap reassurance-layout">
          <div className="reassurance-heading">
            <p className="section-eyebrow">Belanja dengan jelas</p>
            <h2 id="reassurance-title">Dari pilih produk sampai cek stok, Admin siap membantu.</h2>
          </div>
          <div className="reassurance-list">
            <div><span>01</span><p><strong>Ecer dan grosir</strong>Harga dan jumlah minimum tercantum pada informasi produk.</p></div>
            <div><span>02</span><p><strong>Belanja tanpa akun</strong>Guest dapat memilih produk dan mengirim permintaan pesanan.</p></div>
            <div><span>03</span><p><strong>Stok dikonfirmasi Admin</strong>Ketersediaan dapat berubah dan diperiksa sebelum pembayaran.</p></div>
          </div>
        </div>
      </section>

      <section className="member-band">
        <div className="wrap member-band-inner">
          <div>
            <p className="section-eyebrow">Belanja berulang?</p>
            <h2>Daftar gratis untuk menyimpan pesanan dan melihat benefit member.</h2>
          </div>
          <div className="member-band-actions">
            <Link href="/register" className="button button-primary">Daftar gratis</Link>
            <Link href="/reseller" className="text-link">Tentang program reseller</Link>
          </div>
        </div>
      </section>

      <section className="contact-band section-wrap" aria-labelledby="contact-title">
        <div className="wrap contact-inner">
          <div>
            <p className="section-eyebrow">Perlu bantuan memilih?</p>
            <h2 id="contact-title">Tanyakan produk dan ketersediaannya kepada Admin.</h2>
          </div>
          <WhatsAppButton
            number={settings?.whatsapp_admin_number}
            message="Halo Admin Faminis Barokah, saya ingin bertanya tentang produk dan ketersediaannya."
            label="Tanya Admin via WhatsApp"
          />
        </div>
      </section>
    </>
  );
}
