import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { requireAdmin } from "@/lib/admin";
import { formatRupiah } from "@/lib/format";
import { updateOrderStatus } from "@/app/admin/actions";
import type { Order } from "@/types/database";

const nextStatuses: Record<Order["status"], Order["status"][]> = {
  DRAFT: ["WAITING_STOCK_CONFIRMATION", "CANCELLED"],
  WAITING_STOCK_CONFIRMATION: ["STOCK_CONFIRMED", "CANCELLED"],
  STOCK_CONFIRMED: ["WAITING_PAYMENT", "CANCELLED"],
  WAITING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_phone, created_at, subtotal, discount, grand_total, status")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Gagal memuat pesanan: ${error.message}`);

  const orderIds = (data ?? []).map((order) => order.id);
  const lineResult = orderIds.length
    ? await supabase.from("order_items").select("order_id, product_name_snapshot, quantity").in("order_id", orderIds)
    : { data: [], error: null };
  if (lineResult.error) throw new Error(`Gagal memuat detail pesanan: ${lineResult.error.message}`);
  const itemsByOrder = new Map<string, string[]>();
  for (const item of lineResult.data ?? []) {
    const current = itemsByOrder.get(item.order_id) ?? [];
    current.push(`${item.product_name_snapshot} × ${item.quantity}`);
    itemsByOrder.set(item.order_id, current);
  }

  return (
    <main className="admin-page">
      <div className="admin-page-heading"><div><p className="section-eyebrow">Permintaan pelanggan</p><h1>Pesanan</h1></div></div>
      <AdminFeedback searchParams={params} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Pesanan</th><th>Pelanggan</th><th>Produk</th><th>Estimasi</th><th>Status dan tindakan</th></tr></thead>
          <tbody>
            {(data ?? []).map((order) => (
              <tr key={order.id}>
                <td><strong>{order.order_number}</strong><small>{new Date(order.created_at).toLocaleString("id-ID")}</small></td>
                <td>{order.customer_name}<small>{order.customer_phone}</small></td>
                <td>{(itemsByOrder.get(order.id) ?? []).join(", ") || "Tidak ada item"}</td>
                <td>{formatRupiah(Number(order.grand_total))}<small>Diskon: {formatRupiah(Number(order.discount))}</small></td>
                <td>
                  <strong>{order.status}</strong>
                  {nextStatuses[order.status].length ? (
                    <form action={updateOrderStatus} className="inline-admin-form">
                      <input type="hidden" name="id" value={order.id} />
                      <select name="status" aria-label={`Status berikutnya untuk ${order.order_number}`}>
                        {nextStatuses[order.status].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <button className="admin-row-link" type="submit">Ubah</button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
            {!data?.length ? <tr><td colSpan={5}>Belum ada permintaan pesanan dari pelanggan.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <p className="form-help">Perubahan status tidak otomatis mengurangi stok. Pastikan stok fisik dikonfirmasi terlebih dahulu.</p>
    </main>
  );
}
