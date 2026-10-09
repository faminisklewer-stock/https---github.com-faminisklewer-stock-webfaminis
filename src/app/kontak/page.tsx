import Image from "next/image";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi Faminis Barokah Surakarta dan temukan toko kami di marketplace serta media sosial.",
  alternates: { canonical: "/kontak" },
  openGraph: {
    title: "Kontak Faminis Barokah",
    description: "Temukan toko Faminis Barokah dan hubungi kami.",
    url: `${siteUrl}/kontak`,
  },
  twitter: {
    card: "summary",
    title: "Kontak Faminis Barokah",
    description: "Temukan toko Faminis Barokah dan hubungi kami.",
  },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const whatsappNumber = settings?.whatsapp_admin_number?.replace(/\D/g, "");
  const whatsappInternational = whatsappNumber
    ? whatsappNumber.startsWith("0") ? `62${whatsappNumber.slice(1)}` : whatsappNumber
    : null;
  const contacts = [
    { label: "Google Maps", mark: "MAP", href: settings?.google_maps_url },
    { label: "Shopee", mark: "SHOP", href: settings?.shopee_url },
    { label: "TikTok", mark: "TT", href: settings?.tiktok_url },
    { label: "Instagram", mark: "IG", href: settings?.instagram_url },
    { label: "Facebook", mark: "FB", href: settings?.facebook_url },
    {
      label: "WhatsApp",
      mark: "WA",
      href: whatsappInternational ? `https://wa.me/${whatsappInternational}` : null,
    },
  ];

  return (
    <main className="contact-page wrap">
      <div className="contact-shop-photo">
        {settings?.shop_photo_url ? (
          <Image
            src={settings.shop_photo_url}
            alt="Toko Faminis Barokah di Surakarta"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 1200px"
          />
        ) : (
          <div className="contact-shop-photo-empty">
            <span>Foto toko</span>
            <p>Admin dapat menambahkan foto toko melalui Pengaturan.</p>
          </div>
        )}
      </div>
      <header className="contact-page-heading">
        <p className="section-eyebrow">Faminis Barokah · Surakarta</p>
        <h1>Temukan dan hubungi kami</h1>
        <p>Supplier fashion muslim, melayani pembelian ecer maupun grosir.</p>
      </header>
      <section className="contact-links-section" aria-labelledby="contact-links-title">
        <h2 id="contact-links-title">Kunjungi toko kami</h2>
        <div className="contact-links-grid">
          {contacts.map((contact) => contact.href ? (
            <a
              className="contact-link-card"
              href={contact.href}
              key={contact.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-link-mark" aria-hidden="true">{contact.mark}</span>
              <span className="contact-link-label">{contact.label}</span>
              <span className="contact-link-arrow" aria-hidden="true">↗</span>
            </a>
          ) : (
            <div className="contact-link-card contact-link-disabled" key={contact.label} aria-disabled="true">
              <span className="contact-link-mark" aria-hidden="true">{contact.mark}</span>
              <span className="contact-link-label">{contact.label}</span>
              <span className="contact-link-unavailable">Belum diatur</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
