"use client";

import { BrandSymbol } from "@/components/BrandSymbol";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  ["Produk", "/admin/products"],
  ["Kategori", "/admin/categories"],
  ["Carousel Beranda", "/admin/home-carousel"],
  ["Promo", "/admin/promos"],
  ["Pengaturan", "/admin/settings"],
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <Link href="/admin/products" className="admin-brand">
        <BrandSymbol />
        <span>Faminis <b>Barokah</b><small>Panel Admin</small></span>
      </Link>
      <nav aria-label="Menu admin">
        {adminLinks.map(([label, href]) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <Link href={href} key={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>{label}</Link>;
        })}
      </nav>
      <div className="admin-user">
        <span className="admin-avatar" aria-hidden="true">{name.slice(0, 1).toLocaleUpperCase("id-ID") || "A"}</span>
        <span><strong>{name || "Admin"}</strong><small>ADMIN</small></span>
      </div>
      <Link href="/" className="admin-back-link">Kembali ke toko</Link>
    </aside>
  );
}
