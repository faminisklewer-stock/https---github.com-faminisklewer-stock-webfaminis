import type { Order, Product } from "@/types/database";

export const orderStatusLabels: Record<Order["status"], string> = {
  DRAFT: "Draf",
  WAITING_STOCK_CONFIRMATION: "Menunggu konfirmasi stok",
  STOCK_CONFIRMED: "Stok dikonfirmasi",
  WAITING_PAYMENT: "Menunggu pembayaran",
  PAID: "Sudah dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const stockStatusLabels: Record<Product["stock_status"], string> = {
  AVAILABLE: "Tersedia di katalog",
  LOW_STOCK: "Stok menipis",
  OUT_OF_STOCK: "Habis",
  CONFIRM: "Perlu konfirmasi",
};
