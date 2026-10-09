import Link from "next/link";

const adminLinks = [
  ["Ringkasan", "/admin"],
  ["Produk", "/admin/products"],
  ["Kategori", "/admin/categories"],
  ["Pesanan", "/admin/orders"],
  ["Member", "/admin/members"],
  ["Diskon member", "/admin/member-discounts"],
  ["Pengaturan", "/admin/settings"],
];

export function AdminSidebar({ name }: { name: string }) {
  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand">
        <span className="brand-mark" aria-hidden="true">F</span>
        <span>Faminis <b>Barokah</b><small>Panel Admin</small></span>
      </Link>
      <nav aria-label="Menu admin">
        {adminLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
      </nav>
      <div className="admin-user">
        <span className="admin-avatar" aria-hidden="true">{name.slice(0, 1).toLocaleUpperCase("id-ID") || "A"}</span>
        <span><strong>{name || "Admin"}</strong><small>ADMIN</small></span>
      </div>
      <Link href="/" className="admin-back-link">Kembali ke toko</Link>
    </aside>
  );
}
