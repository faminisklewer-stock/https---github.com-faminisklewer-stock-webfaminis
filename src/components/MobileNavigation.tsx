import Link from "next/link";
import { Icon } from "@/components/Icons";

const items = [
  { label: "Beranda", href: "/", icon: "home" as const },
  { label: "Kategori", href: "/produk", icon: "list" as const },
  { label: "Keranjang", href: "/keranjang", icon: "bag" as const },
  { label: "Pesanan", href: "/akun?tab=pesanan", icon: "box" as const },
  { label: "Akun", href: "/akun", icon: "user" as const },
];

export function MobileNavigation() {
  return (
    <nav className="mobile-bottom-nav" aria-label="Navigasi bawah">
      {items.map((item) => (
        <Link href={item.href} key={item.label}>
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
