import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatRupiah } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { orderStatusLabels } from "@/lib/admin-labels";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const current = new Date();
  const today = new Date(current.getFullYear(), current.getMonth(), current.getDate()).toISOString();
  const month = new Date(current.getFullYear(), current.getMonth(), 1).toISOString();
  const [
    categoriesCount, waitingCount, lowStock,
    memberCount, resellerCount, todayOrders, monthOrders, revenueOrders, waitingOrders,
  ] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "WAITING_STOCK_CONFIRMATION"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("stock_status", "LOW_STOCK"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "CUSTOMER").eq("member_status", "ACTIVE"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "CUSTOMER").eq("reseller_status", "APPROVED"),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", month),
    supabase.from("orders").select("grand_total").in("status", ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"]),
    supabase.from("orders")
      .select("id, order_number, customer_name, created_at, grand_total, status")
      .eq("status", "WAITING_STOCK_CONFIRMATION").order("created_at", { ascending: true }).limit(5),
  ]);

  const errors = [
    categoriesCount.error, waitingCount.error, lowStock.error,
    memberCount.error, resellerCount.error, todayOrders.error, monthOrders.error, revenueOrders.error,
    waitingOrders.error,
  ].filter(Boolean);
  if (errors.length) throw new Error(`Gagal memuat ringkasan admin: ${errors.map((error) => error?.message).join("; ")}`);

  const revenue = (revenueOrders.data ?? []).reduce((sum, order) => sum + Number(order.grand_total), 0);
  const metrics = [
    ["Perlu konfirmasi stok", String(waitingCount.count ?? 0), "/admin/orders"],
    ["Stok menipis", String(lowStock.count ?? 0), "/admin/products"],
    ["Pesanan hari ini", String(todayOrders.count ?? 0), "/admin/orders"],
    ["Member aktif", String(memberCount.count ?? 0), "/admin/members"],
  ];

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="Ringkasan toko"
        title="Dashboard"
        description="Prioritaskan pesanan yang membutuhkan konfirmasi, lalu pantau kondisi katalog."
        actions={<Link href="/admin/orders" className="button button-primary">Buka pesanan</Link>}
      />
      <section className="admin-metrics" aria-label="Ringkasan data toko">
        {metrics.map(([label, value, href]) => (
          <Link className="admin-metric" href={href} key={label}>
            <span>{label}</span><strong>{value}</strong><span className="admin-metric-link">Lihat daftar</span>
          </Link>
        ))}
      </section>
      <section className="admin-work-queue" aria-labelledby="admin-work-queue-title">
        <div className="admin-section-heading">
          <div>
            <h2 id="admin-work-queue-title">Pesanan menunggu konfirmasi stok</h2>
            <p>Periksa stok fisik sebelum melanjutkan pesanan.</p>
          </div>
          <Link href="/admin/orders?status=WAITING_STOCK_CONFIRMATION" className="text-link">Semua pesanan terkait</Link>
        </div>
        {waitingOrders.data?.length ? (
          <ul className="admin-queue-list">
            {waitingOrders.data.map((order) => (
              <li key={order.id}>
                <div><strong>{order.order_number}</strong><span>{order.customer_name}</span></div>
                <div><span>{orderStatusLabels[order.status]}</span><time dateTime={order.created_at}>{new Date(order.created_at).toLocaleDateString("id-ID")}</time></div>
                <strong>{formatRupiah(Number(order.grand_total))}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-empty-state">Tidak ada pesanan yang menunggu konfirmasi stok saat ini.</p>
        )}
        <p className="form-help">{lowStock.count ?? 0} produk ditandai stok menipis. Status katalog bukan jaminan jumlah stok fisik.</p>
      </section>
      <p className="admin-data-note">
        Omzet pesanan terkonfirmasi {formatRupiah(revenue)} · {categoriesCount.count ?? 0} kategori ·
        {" "}{resellerCount.count ?? 0} reseller disetujui · {monthOrders.count ?? 0} pesanan bulan ini
      </p>
    </main>
  );
}
