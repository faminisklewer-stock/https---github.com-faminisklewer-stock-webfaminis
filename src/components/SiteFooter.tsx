import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { BrandSymbol } from "@/components/BrandSymbol";
import { FloatingWhatsAppButton } from "@/components/WhatsAppButton";

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
          <address className="footer-address">{settings?.address || "Surakarta, Jawa Tengah"}</address>
        </div>
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
