export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function makeWhatsAppUrl(number: string | null | undefined, message: string) {
  const normalized = number?.replace(/\D/g, "");
  if (!normalized || normalized.length < 10 || normalized.length > 15) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
