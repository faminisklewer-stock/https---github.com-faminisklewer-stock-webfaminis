export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function makeWhatsAppUrl(number: string | null | undefined, message: string) {
  const digits = number?.replace(/\D/g, "");
  const normalized = digits?.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits?.startsWith("8")
      ? `62${digits}`
      : digits;
  if (!normalized || normalized.length < 10 || normalized.length > 15) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
