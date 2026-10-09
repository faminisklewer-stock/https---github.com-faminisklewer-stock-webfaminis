import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatRupiah } from "@/lib/format";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const current = new Date();
  const today = new Date(current.getFullYear(), current.getMonth(), current.getDate()).toISOString();
  const month = new Date(current.getFullYear(), current.getMonth(), 1).toISOString();
  const [
    productCount, categoriesCount, orderCount, waitingCount, lowStock,
    memberCount, resellerCount, todayOrders, monthOrders, revenueOrders,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "WAITING_STOCK_CONFIRMATION"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("stock_status", "LOW_STOCK"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("member_status", "ACTIVE"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("reseller_status", "APPROVED"),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", month),
    supabase.from("orders").select("grand_total").in("status", ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"]),
  ]);

  const errors = [
    productCount.error, categoriesCount.error, orderCount.error, waitingCount.error, lowStock.error,
    memberCount.error, resellerCount.error, todayOrders.error, monthOrders.error, revenueOrders.error,
  ].filter(Boolean);
  if (errors.length) throw new Error(`Gagal memuat ringkasan admin: ${errors.map((error) => error?.message).join("; ")}`);

  const revenue = (revenueOrders.data ?? []).reduce((sum, order) => sum + Number(order.grand_total), 0);
  const metrics = [
    ["Omzet pesanan terkonfirmasi", formatRupiah(revenue)],
    ["Pesanan hari ini", String(todayOrders.count ?? 0)],
    ["Pesanan bulan ini", String(monthOrders.count ?? 0)],
    ["Menunggu konfirmasi stok", String(waitingCount.count ?? 0)],
    ["Produk aktif", String(productCount.count ?? 0)],
    ["Kategori aktif", String(categoriesCount.count ?? 0)],
    ["Stok menipis", String(lowStock.count ?? 0)],
    ["Member aktif", String(memberCount.count ?? 0)],
    ["Reseller disetujui", String(resellerCount.count ?? 0)],
  ];

  return (
    <main className="admin-page">
      <div className="admin-page-heading">
        <div><p className="section-eyebrow">Ringkasan toko</p><h1>Dashboard</h1></div>
        <Link href="/admin/orders" className="button button-primary">Periksa pesanan</Link>
      </div>
      <section className="admin-metrics" aria-label="Ringkasan data toko">
        {metrics.map(([label, value]) => (
          <article className="admin-metric" key={label}><span>{label}</span><strong>{value}</strong></article>
        ))}
      </section>
      <section className="admin-panel">
        <h2>Perlu diperiksa</h2>
        <p>{waitingCount.count ?? 0} pesanan menunggu konfirmasi stok.</p>
        <p>{lowStock.count ?? 0} produk ditandai stok menipis di katalog. Status ini bukan jaminan jumlah fisik.</p>
        <Link href="/admin/orders" className="text-link">Buka daftar pesanan</Link>
      </section>
    </main>
  );
}
