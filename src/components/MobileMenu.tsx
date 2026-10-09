"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icons";

type MenuLink = { label: string; href: string };

export function MobileMenu({ links }: { links: MenuLink[] }) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const catalogCategoryRoute = /^\/(daster|mukena|sarung|gamis|setelan|kaftan|sajadah|baju-koko)(\/|$)/.test(pathname);

  return (
    <details className="mobile-menu" ref={menuRef}>
      <summary aria-label="Buka menu navigasi">
        <Icon name="menu" />
        <span>Menu</span>
      </summary>
      <nav className="mobile-menu-panel" aria-label="Menu utama">
        {links.map((link) => {
          const active = pathname === link.href
            || (link.href === "/produk" && (pathname.startsWith("/produk/") || catalogCategoryRoute));
          return (
            <Link
              href={link.href}
              key={link.href}
              aria-current={active ? "page" : undefined}
              onClick={() => menuRef.current?.removeAttribute("open")}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </details>
  );
}
