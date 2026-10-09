import Link from "next/link";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/admin";
import { formatRupiah } from "@/lib/format";
import { orderStatusLabels } from "@/lib/admin-labels";
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

const statuses = Object.keys(orderStatusLabels) as Order["status"][];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const selectedStatus = typeof params.status === "string" && statuses.includes(params.status as Order["status"])
    ? params.status as Order["status"]
    : "all";
  let ordersQuery = supabase.from("orders")
    .select("id, order_number, customer_name, customer_phone, created_at, subtotal, discount, grand_total, status")
    .order("created_at", { ascending: false }).limit(100);
  if (selectedStatus !== "all") ordersQuery = ordersQuery.eq("status", selectedStatus);
  const { data, error } = await ordersQuery;
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
      <AdminPageHeader
        eyebrow="Permintaan pelanggan"
        title="Pesanan"
        description="Tinjau isi pesanan dan lanjutkan status setelah stok atau pembayaran dikonfirmasi."
      />
      <AdminFeedback searchParams={params} />
      <form className="admin-list-tools order-list-tools" method="get">
        <label className="field-label">Filter status
          <select name="status" defaultValue={selectedStatus}>
            <option value="all">Semua status</option>
            {statuses.map((status) => <option value={status} key={status}>{orderStatusLabels[status]}</option>)}
          </select>
        </label>
        <button className="button button-secondary" type="submit">Tampilkan</button>
        {selectedStatus !== "all" ? <Link href="/admin/orders" className="text-link">Hapus filter</Link> : null}
        <span className="admin-list-count">
          {(data ?? []).length} pesanan ditampilkan{data?.length === 100 ? " (maksimal 100 terbaru)" : ""}
        </span>
      </form>
      {data?.length ? (
        <div className="admin-record-list order-record-list">
          {data.map((order) => (
            <article className="admin-record order-record" key={order.id}>
              <div className="admin-record-main">
                <p className="admin-record-kicker">Pesanan</p>
                <h2>{order.order_number}</h2>
                <time className="admin-record-subtitle" dateTime={order.created_at}>
                  {new Date(order.created_at).toLocaleString("id-ID")}
                </time>
                <strong className={`admin-status order-status-${order.status.toLowerCase()}`}>{orderStatusLabels[order.status]}</strong>
              </div>
              <div className="admin-order-customer">
                <span>Pelanggan</span>
                <strong>{order.customer_name}</strong>
                <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
              </div>
              <div className="admin-order-items">
                <span>Isi pesanan</span>
                {itemsByOrder.get(order.id)?.length ? (
                  <ul>{itemsByOrder.get(order.id)?.map((item, index) => <li key={`${order.id}-${index}`}>{item}</li>)}</ul>
                ) : <p>Detail produk tidak tersedia.</p>}
              </div>
              <div className="admin-order-total">
                <span>Total pesanan</span>
                <strong>{formatRupiah(Number(order.grand_total))}</strong>
                {Number(order.discount) > 0 ? <small>Diskon {formatRupiah(Number(order.discount))}</small> : null}
              </div>
              <div className="admin-order-action">
                {nextStatuses[order.status].length ? (
                  <form action={updateOrderStatus} className="admin-order-status-form">
                    <input type="hidden" name="id" value={order.id} />
                    <label className="field-label" htmlFor={`status-${order.id}`}>Lanjutkan status</label>
                    <select id={`status-${order.id}`} name="status" defaultValue={nextStatuses[order.status][0]}>
                      {nextStatuses[order.status].map((status) => <option key={status} value={status}>{orderStatusLabels[status]}</option>)}
                    </select>
                    <button className="button button-secondary" type="submit">Simpan status</button>
                  </form>
                ) : <p className="admin-empty-state">Tidak ada tindakan lanjutan.</p>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="admin-state-panel">
          <h2>{selectedStatus === "all" ? "Belum ada pesanan" : `Tidak ada pesanan berstatus “${orderStatusLabels[selectedStatus]}”`}</h2>
          <p>{selectedStatus === "all" ? "Pesanan pelanggan akan muncul di sini setelah checkout." : "Pilih status lain atau tampilkan semua pesanan."}</p>
          {selectedStatus !== "all" ? <Link className="button button-secondary" href="/admin/orders">Tampilkan semua</Link> : null}
        </section>
      )}
      <p className="form-help">Perubahan status tidak otomatis mengurangi stok. Pastikan stok fisik dikonfirmasi terlebih dahulu.</p>
    </main>
  );
}
