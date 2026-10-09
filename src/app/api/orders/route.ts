import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/site-settings";
import { formatRupiah, makeWhatsAppUrl } from "@/lib/format";

const orderSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_phone: z.string().trim().regex(/^[+0-9()\s-]{8,20}$/),
  customer_email: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
  address: z.string().trim().min(5).max(500),
  district: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().min(2).max(100),
  postal_code: z.string().trim().min(3).max(12),
  notes: z.string().trim().max(1000).optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid().nullable(),
    quantity: z.number().int().min(1).max(99),
    price_type: z.enum(["ECER", "GROSIR"]),
  })).min(1).max(50),
});

type OrderItemResult = {
  product_name: string;
  variant: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type OrderResult = {
  order_number: string;
  status: string;
  customer_status: string;
  subtotal: number;
  discount: number;
  grand_total: number;
  items: OrderItemResult[];
};

function isOrderResult(value: unknown): value is OrderResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<OrderResult>;
  return (
    typeof result.order_number === "string" &&
    typeof result.status === "string" &&
    typeof result.customer_status === "string" &&
    typeof result.subtotal === "number" &&
    typeof result.discount === "number" &&
    typeof result.grand_total === "number" &&
    Array.isArray(result.items) &&
    result.items.every((item) =>
      item !== null &&
      typeof item === "object" &&
      typeof item.product_name === "string" &&
      typeof item.quantity === "number" &&
      typeof item.unit_price === "number" &&
      typeof item.subtotal === "number",
    )
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Format data pesanan tidak valid." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Periksa kembali data kontak, alamat, dan produk dalam keranjang." },
      { status: 400 },
    );
  }

  const [supabase, settings] = await Promise.all([
    createSupabaseServerClient(),
    getSiteSettings(),
  ]);
  if (!supabase) {
    return Response.json({ error: "Koneksi Supabase belum dikonfigurasi." }, { status: 503 });
  }
  if (!settings?.whatsapp_admin_number) {
    return Response.json({ error: "Nomor WhatsApp Admin belum diatur." }, { status: 503 });
  }

  const { data, error } = await supabase.rpc("create_order_request", {
    p_customer_name: parsed.data.customer_name,
    p_customer_phone: parsed.data.customer_phone,
    p_customer_email: parsed.data.customer_email || null,
    p_address: parsed.data.address,
    p_district: parsed.data.district,
    p_city: parsed.data.city,
    p_province: parsed.data.province,
    p_postal_code: parsed.data.postal_code,
    p_notes: parsed.data.notes || null,
    p_items: parsed.data.items,
  });

  if (error) {
    console.error("Order request could not be created.", error);
    return Response.json(
      { error: "Pesanan belum dapat dibuat. Periksa produk dan jumlah, lalu coba lagi." },
      { status: 422 },
    );
  }
  if (!isOrderResult(data)) {
    console.error("Order request returned an unexpected result.");
    return Response.json({ error: "Hasil pesanan tidak dapat dibaca. Hubungi Admin." }, { status: 500 });
  }

  const itemLines = data.items.map((item, index) => [
    `${index + 1}. ${item.product_name}`,
    item.variant ? `   Varian: ${item.variant}` : null,
    `   Qty: ${item.quantity}`,
    `   Harga: ${formatRupiah(item.unit_price)}`,
    `   Subtotal: ${formatRupiah(item.subtotal)}`,
  ].filter(Boolean).join("\n")).join("\n\n");
  const message = [
    "Halo Admin Faminis Barokah 👋",
    "",
    "Saya ingin menanyakan dan melakukan pemesanan.",
    "",
    "━━━━━━━━━━━━━━━━━━",
    "DETAIL PESANAN",
    "━━━━━━━━━━━━━━━━━━",
    "",
    `Nomor Pesanan: ${data.order_number}`,
    `Nama: ${parsed.data.customer_name}`,
    `No. WhatsApp: ${parsed.data.customer_phone}`,
    `Status: ${data.customer_status}`,
    "",
    "Produk:",
    itemLines,
    "",
    "━━━━━━━━━━━━━━━━━━",
    "RINGKASAN",
    "━━━━━━━━━━━━━━━━━━",
    "",
    `Subtotal: ${formatRupiah(data.subtotal)}`,
    `Diskon Member: -${formatRupiah(data.discount)}`,
    `Estimasi Total: ${formatRupiah(data.grand_total)}`,
    "",
    `Alamat: ${parsed.data.address}, ${parsed.data.district}, ${parsed.data.city}, ${parsed.data.province}, ${parsed.data.postal_code}`,
    `Catatan: ${parsed.data.notes || "-"}`,
    "",
    "Mohon bantu cek ketersediaan stok terlebih dahulu.",
    "Jika stok tersedia, mohon informasikan total akhir dan langkah pembayaran.",
    "",
    "Terima kasih 🙏",
  ].join("\n");
  const whatsappUrl = makeWhatsAppUrl(settings.whatsapp_admin_number, message);
  if (!whatsappUrl) {
    console.error("Configured WhatsApp number is invalid.");
    return Response.json({ error: "Nomor WhatsApp Admin belum valid." }, { status: 503 });
  }

  return Response.json({
    orderNumber: data.order_number,
    status: data.status,
    whatsappUrl,
  });
}
