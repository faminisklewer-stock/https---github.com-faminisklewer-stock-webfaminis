import Image from "next/image";
import type { Metadata } from "next";
import { ContactPlatformIcon, type ContactPlatform } from "@/components/ContactPlatformIcon";
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
  const phoneValue = settings?.phone?.replace(/[^\d+]/g, "");
  const phoneHref = phoneValue && /\d/.test(phoneValue) ? `tel:${phoneValue}` : null;
  const contacts = [
    { label: "Google Maps", href: settings?.google_maps_url, external: true },
    { label: "Shopee", href: settings?.shopee_url, external: true },
    { label: "TikTok", href: settings?.tiktok_url, external: true },
    { label: "Instagram", href: settings?.instagram_url, external: true },
    { label: "Facebook", href: settings?.facebook_url, external: true },
    {
      label: "WhatsApp",
      href: whatsappInternational ? `https://wa.me/${whatsappInternational}` : null,
      external: true,
    },
    { label: "Telepon", href: phoneHref, external: false },
    { label: "Email", href: settings?.email ? `mailto:${settings.email}` : null, external: false },
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
        <p>{settings?.store_description || "Supplier fashion muslim, melayani pembelian ecer maupun grosir."}</p>
        {settings?.address ? <address className="contact-store-address">{settings.address}</address> : null}
      </header>
      <section className="contact-links-section" aria-labelledby="contact-links-title">
        <h2 id="contact-links-title">Kunjungi toko kami</h2>
        <div className="contact-links-grid">
          {contacts.map((contact) => contact.href ? (
            <a
              className="contact-link-card"
              href={contact.href}
              key={contact.label}
              target={contact.external ? "_blank" : undefined}
              rel={contact.external ? "noopener noreferrer" : undefined}
            >
              <span className={`contact-link-mark contact-link-mark-${contact.label.toLowerCase().replaceAll(" ", "-")}`} aria-hidden="true">
                <ContactPlatformIcon platform={contact.label as ContactPlatform} />
              </span>
              <span className="contact-link-label">{contact.label}</span>
              {contact.external ? <span className="contact-link-arrow" aria-hidden="true">↗</span> : null}
            </a>
          ) : (
            <div className="contact-link-card contact-link-disabled" key={contact.label} aria-disabled="true">
              <span className="contact-link-mark" aria-hidden="true">
                <ContactPlatformIcon platform={contact.label as ContactPlatform} />
              </span>
              <span className="contact-link-label">{contact.label}</span>
              <span className="contact-link-unavailable">Belum diatur</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
