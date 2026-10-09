import type { Product } from "@/types/database";

export const stockStatusLabels: Record<Product["stock_status"], string> = {
  AVAILABLE: "Tersedia di katalog",
  LOW_STOCK: "Stok menipis",
  OUT_OF_STOCK: "Habis",
  CONFIRM: "Perlu konfirmasi",
};
