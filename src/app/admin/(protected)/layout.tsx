import type { Metadata } from "next";
import Link from "next/link";
import { BrandSymbol } from "@/components/BrandSymbol";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { profile } = await requireAdmin();
  return (
    <>
      <a className="skip-link" href="#konten-utama">Lewati ke konten</a>
      <div className="admin-shell">
        <AdminSidebar name={profile.full_name} />
        <div className="admin-content">
          <header className="admin-topbar">
            <div className="admin-topbar-brand">
              <BrandSymbol />
              <span><strong>Faminis Barokah</strong><small>Panel admin</small></span>
            </div>
            <Link className="button button-secondary" href="/">Lihat toko</Link>
          </header>
          <div id="konten-utama">{children}</div>
        </div>
      </div>
    </>
  );
}
