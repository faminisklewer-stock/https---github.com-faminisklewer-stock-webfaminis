import Link from "next/link";
import { Icon } from "@/components/Icons";
import { SearchBar } from "@/components/SearchBar";
import { AccountNav } from "@/components/AccountNav";

const links = [
  { label: "Beranda", href: "/" },
  { label: "Semua Produk", href: "/produk" },
  { label: "Daster", href: "/daster" },
  { label: "Mukena", href: "/mukena" },
  { label: "Gamis", href: "/gamis" },
  { label: "Sarung", href: "/sarung" },
  { label: "Reseller", href: "/reseller" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-main wrap">
        <details className="mobile-menu">
          <summary aria-label="Buka menu">
            <Icon name="menu" />
          </summary>
          <nav className="mobile-menu-panel" aria-label="Menu utama">
            {links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
            <Link href="/tentang-kami">Tentang Kami</Link>
            <Link href="/kontak">Kontak</Link>
          </nav>
        </details>

        <Link href="/" className="brand-lockup" aria-label="Faminis Barokah, Beranda">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span className="brand-name">Faminis <b>Barokah</b></span>
        </Link>

        <div className="header-search">
          <SearchBar />
        </div>

        <div className="header-actions">
          <AccountNav />
          <Link className="header-action order-link" href="/akun?tab=pesanan">
            <Icon name="box" />
            <span>Pesanan</span>
          </Link>
          <Link className="header-action cart-link" href="/keranjang" aria-label="Keranjang">
            <Icon name="bag" />
            <span className="cart-label">Keranjang</span>
          </Link>
        </div>
      </div>

      <div className="header-nav-row">
        <nav className="desktop-nav wrap" aria-label="Kategori dan halaman">
          {links.map((link) => (
            <Link href={link.href} key={link.href}>{link.label}</Link>
          ))}
          <Link href="/panduan-grosir">Panduan Grosir</Link>
        </nav>
      </div>

      <div className="mobile-search wrap"><SearchBar /></div>
    </header>
  );
}
