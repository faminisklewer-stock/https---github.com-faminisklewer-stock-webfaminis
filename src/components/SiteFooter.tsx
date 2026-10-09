import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const shopLinks = [
  ["Semua Produk", "/produk"],
  ["Daster", "/daster"],
  ["Mukena", "/mukena"],
  ["Gamis", "/gamis"],
  ["Sarung", "/sarung"],
];

const helpLinks = [
  ["Panduan Grosir", "/panduan-grosir"],
  ["Pertanyaan Umum", "/faq"],
  ["Hubungi Kami", "/kontak"],
  ["Tentang Kami", "/tentang-kami"],
];

export async function SiteFooter() {
  const settings = await getSiteSettings();
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div className="footer-brand">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">F</span>
            <span className="brand-name">Faminis <b>Barokah</b></span>
          </Link>
          <p>Supplier dan grosir fashion muslim dari Surakarta. Belanja ecer maupun grosir.</p>
        </div>
        <div className="footer-column">
          <h2>Belanja</h2>
          {shopLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        </div>
        <div className="footer-column">
          <h2>Bantuan</h2>
          {helpLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        </div>
        <div className="footer-column">
          <h2>Reseller</h2>
          <Link href="/reseller">Program Reseller</Link>
          <Link href="/register">Daftar Gratis</Link>
          <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
          <Link href="/syarat-dan-ketentuan">Syarat dan Ketentuan</Link>
        </div>
        <div className="footer-column footer-socials">
          <h2>Hubungi kami</h2>
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
      </div>
    </footer>
  );
}
