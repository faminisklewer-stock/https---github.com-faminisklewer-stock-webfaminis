import Link from "next/link";
import { ContactPlatformIcon, type ContactPlatform } from "@/components/ContactPlatformIcon";
import { makeWhatsAppUrl } from "@/lib/format";
import { getSiteSettings } from "@/lib/site-settings";
import { BrandSymbol } from "@/components/BrandSymbol";
import { FloatingWhatsAppButton } from "@/components/WhatsAppButton";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const phone = settings?.phone?.replace(/[^\d+]/g, "");
  const channels: { label: ContactPlatform; href: string; external: boolean }[] = [];
  const externalChannels: { label: ContactPlatform; href: string | null | undefined }[] = [
    { label: "Instagram", href: settings?.instagram_url },
    { label: "TikTok", href: settings?.tiktok_url },
    { label: "Facebook", href: settings?.facebook_url },
    { label: "Shopee", href: settings?.shopee_url },
    { label: "Google Maps", href: settings?.google_maps_url },
    {
      label: "WhatsApp",
      href: makeWhatsAppUrl(
        settings?.whatsapp_admin_number,
        "Halo Admin Faminis Barokah, saya ingin bertanya tentang produk atau cara pemesanan. Mohon bantuannya.",
      ),
    },
  ];
  for (const channel of externalChannels) {
    if (channel.href) channels.push({ ...channel, href: channel.href, external: true });
  }
  if (phone && /\d/.test(phone)) {
    channels.push({ label: "Telepon", href: `tel:${phone}`, external: false });
  }
  if (settings?.email) {
    channels.push({ label: "Email", href: `mailto:${settings.email}`, external: false });
  }

  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div className="footer-brand">
          <Link href="/" className="brand-lockup">
            <BrandSymbol />
            <span className="brand-name">Faminis <b>Barokah</b></span>
          </Link>
          <address className="footer-address">{settings?.address || "Surakarta, Jawa Tengah"}</address>
        </div>
        {channels.length ? (
          <nav className="footer-channels" aria-label="Media sosial dan kanal resmi">
            <h2>Media sosial dan kanal resmi</h2>
            <ul>
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    target={channel.external ? "_blank" : undefined}
                    rel={channel.external ? "noopener noreferrer" : undefined}
                  >
                    <span className="footer-channel-icon" aria-hidden="true">
                      <ContactPlatformIcon platform={channel.label} />
                    </span>
                    <span>{channel.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Faminis Barokah</span>
        <nav className="footer-legal" aria-label="Informasi hukum">
          <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
          <Link href="/syarat-dan-ketentuan">Syarat dan Ketentuan</Link>
        </nav>
      </div>
      <FloatingWhatsAppButton
        number={settings?.whatsapp_admin_number}
        message="Halo Admin Faminis Barokah, saya ingin bertanya tentang produk atau cara pemesanan. Mohon bantuannya."
      />
    </footer>
  );
}
