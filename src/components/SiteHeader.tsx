"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icons";
import { BrandSymbol } from "@/components/BrandSymbol";
import { SearchBar } from "@/components/SearchBar";
import { MobileMenu } from "@/components/MobileMenu";

const links = [
  { label: "Beranda", href: "/" },
  { label: "Katalog", href: "/produk" },
  { label: "Promo", href: "/promo" },
  { label: "Kontak", href: "/kontak" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const catalogCategoryRoute = /^\/(daster|mukena|sarung|gamis|setelan|kaftan|sajadah|baju-koko)(\/|$)/.test(pathname);

  return (
    <header className="site-header">
      <div className="header-main wrap">
        <Link href="/" className="brand-lockup" aria-label="Faminis Barokah, Beranda">
          <BrandSymbol />
          <span className="brand-name">Faminis <b>Barokah</b><small>Grosir &amp; Ecer Fashion Muslim</small></span>
        </Link>

        <MobileMenu links={links} />

        <div className="header-search">
          <SearchBar />
        </div>

        <nav className="desktop-nav" aria-label="Navigasi utama">
          {links.map((link) => {
            const active = pathname === link.href
              || (link.href === "/produk" && (pathname.startsWith("/produk/") || catalogCategoryRoute));
            return (
              <Link href={link.href} key={link.href} aria-current={active ? "page" : undefined}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          <Link className="header-action cart-link" href="/keranjang" aria-label="Keranjang">
            <Icon name="bag" />
            <span className="cart-label">Keranjang</span>
          </Link>
        </div>
      </div>

      <div className="mobile-search wrap"><SearchBar /></div>
    </header>
  );
}
