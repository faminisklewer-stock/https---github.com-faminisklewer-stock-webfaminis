import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { BrandSymbol } from "@/components/BrandSymbol";
import { FloatingWhatsAppButton, WhatsAppButton } from "@/components/WhatsAppButton";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div className="footer-brand">
          <Link href="/" className="brand-lockup">
            <BrandSymbol />
            <span className="brand-name">Faminis <b>Barokah</b></span>
          </Link>
          <p>Supplier dan grosir fashion muslim dari Surakarta. Belanja ecer maupun grosir.</p>
        </div>
        <div className="footer-column footer-contact">
          <h2>Kontak</h2>
          <Link href="/kontak">Informasi toko dan kontak</Link>
          {settings?.instagram_url ? <a href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram</a> : null}
          {settings?.tiktok_url ? <a href={settings.tiktok_url} target="_blank" rel="noreferrer">TikTok</a> : null}
          {settings?.facebook_url ? <a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a> : null}
          {settings?.email ? <a href={`mailto:${settings.email}`}>Email Admin</a> : null}
          <WhatsAppButton
            number={settings?.whatsapp_admin_number}
            message="Halo Admin Faminis Barokah, saya ingin bertanya."
            label="WhatsApp Admin"
            className="footer-whatsapp"
          />
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© Faminis Barokah</span>
        <span>Surakarta, Jawa Tengah</span>
        <nav className="footer-legal" aria-label="Informasi hukum">
          <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
          <Link href="/syarat-dan-ketentuan">Syarat dan Ketentuan</Link>
        </nav>
      </div>
      <FloatingWhatsAppButton
        number={settings?.whatsapp_admin_number}
        message="Halo Admin Faminis Barokah, saya ingin bertanya."
      />
    </footer>
  );
}
