import Image from "next/image";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Promo",
  description: "Temukan promo TikTok Live dan grup reseller Faminis Barokah.",
  alternates: { canonical: "/promo" },
  openGraph: {
    title: "Promo Faminis Barokah",
    description: "Temukan promo TikTok Live dan grup reseller Faminis Barokah.",
    url: `${siteUrl}/promo`,
  },
  twitter: {
    card: "summary",
    title: "Promo Faminis Barokah",
    description: "Temukan promo TikTok Live dan grup reseller Faminis Barokah.",
  },
};

export default async function PromoPage() {
  const settings = await getSiteSettings();
  const promos = [
    {
      title: "Promo TikTok Live",
      description: "Kunjungi TikTok Live Faminis untuk melihat informasi promo yang sedang berlangsung.",
      image: settings?.promo_tiktok_image_url,
      href: settings?.promo_tiktok_url,
    },
    {
      title: "Grup Reseller Faminis",
      description: "Gabung ke grup WhatsApp reseller untuk mengikuti kabar dan informasi dari Faminis.",
      image: settings?.promo_reseller_image_url,
      href: settings?.reseller_whatsapp_group_url,
    },
  ];

  return (
    <main className="promo-page wrap">
      <header className="promo-page-heading">
        <p className="section-eyebrow">Faminis Barokah</p>
        <h1>Promo dan komunitas</h1>
        <p>Ikuti TikTok Live dan kabar reseller Faminis melalui tautan berikut.</p>
      </header>
      <div className="promo-cards">
        {promos.map((promo) => (
          <article className="promo-card" key={promo.title}>
            <div className={`promo-card-artwork${promo.image ? "" : " promo-card-artwork-empty"}`}>
              {promo.image ? (
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 600px"
                />
              ) : (
                <span>Gambar promo dapat ditambahkan Admin</span>
              )}
            </div>
            <div className="promo-card-content">
              <div>
                <h2>{promo.title}</h2>
                <p>{promo.description}</p>
              </div>
              {promo.href ? (
                <a className="button button-primary promo-card-action" href={promo.href} target="_blank" rel="noopener noreferrer">
                  Lihat Detail Promo
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="promo-card-unavailable" aria-disabled="true">
                  Tautan promo belum diatur Admin
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
