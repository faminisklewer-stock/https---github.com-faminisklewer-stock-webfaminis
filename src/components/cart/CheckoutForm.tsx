"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatRupiah } from "@/lib/format";

type CheckoutResponse = { error?: string; whatsappUrl?: string };

export function CheckoutForm() {
  const { items, ready, clearCart } = useCart();
  const [errorMessage, setErrorMessage] = useState("");
  const [sending, setSending] = useState(false);
  const estimate = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (!items.length) {
      setErrorMessage("Keranjang kosong. Tambahkan produk sebelum checkout.");
      return;
    }
    setSending(true);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.get("customer_name"),
          customer_phone: form.get("customer_phone"),
          customer_email: form.get("customer_email"),
          address: form.get("address"),
          district: form.get("district"),
          city: form.get("city"),
          province: form.get("province"),
          postal_code: form.get("postal_code"),
          notes: form.get("notes"),
          items: items.map((item) => ({
            product_id: item.productId,
            variant_id: item.variantId,
            quantity: item.quantity,
            price_type: item.priceType,
          })),
        }),
      });
      const result = await response.json() as CheckoutResponse;
      if (!response.ok || !result.whatsappUrl) {
        setErrorMessage(result.error || "Permintaan pesanan belum dapat dikirim.");
        return;
      }
      clearCart();
      window.location.assign(result.whatsappUrl);
    } catch (error) {
      console.error("Checkout request failed.", error);
      setErrorMessage("Koneksi terputus. Periksa jaringan, lalu coba kirim kembali.");
    } finally {
      setSending(false);
    }
  }

  if (!ready) return <p role="status">Memuat ringkasan keranjang...</p>;
  if (!items.length) {
    return (
      <div className="empty-state">
        <h2>Keranjang kamu masih kosong</h2>
        <p>Pilih produk terlebih dahulu, lalu lanjutkan untuk meminta konfirmasi stok.</p>
        <Link href="/produk" className="button button-primary">Lihat produk</Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <form className="checkout-form" onSubmit={submitOrder}>
        <div className="field-grid">
          <label className="field-label">Nama lengkap<input name="customer_name" autoComplete="name" required minLength={2} maxLength={120} /></label>
          <label className="field-label">Nomor WhatsApp<input name="customer_phone" type="tel" autoComplete="tel" required pattern="[+0-9() -]{8,20}" /></label>
          <label className="field-label">Email, opsional<input name="customer_email" type="email" autoComplete="email" /></label>
          <label className="field-label">Kecamatan<input name="district" autoComplete="address-level3" required minLength={2} maxLength={100} /></label>
          <label className="field-label">Kota / Kabupaten<input name="city" autoComplete="address-level2" required minLength={2} maxLength={100} /></label>
          <label className="field-label">Provinsi<input name="province" autoComplete="address-level1" required minLength={2} maxLength={100} /></label>
          <label className="field-label">Kode Pos<input name="postal_code" autoComplete="postal-code" required minLength={3} maxLength={12} /></label>
        </div>
        <label className="field-label">Alamat lengkap<textarea name="address" autoComplete="street-address" required minLength={5} maxLength={500} /></label>
        <label className="field-label">Catatan untuk Admin, opsional<textarea name="notes" maxLength={1000} /></label>
        <div className="checkout-disclaimer">
          Stok dan total akhir akan dikonfirmasi oleh Admin Faminis Barokah melalui WhatsApp sebelum pembayaran.
          Harga dan diskon akan dihitung ulang di server. Checkout tidak mengurangi stok dan tidak memproses pembayaran.
        </div>
        {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
        <button type="submit" className="button button-primary button-wide" disabled={sending}>
          {sending ? "Menyimpan permintaan..." : "Konfirmasi Pesanan via WhatsApp"}
        </button>
      </form>
      <aside className="cart-summary">
        <h2>Ringkasan estimasi</h2>
        {items.map((item) => (
          <div className="checkout-line" key={`${item.productId}-${item.variantId ?? "default"}`}>
            <span>{item.name}{item.variantName ? `, ${item.variantName}` : ""} × {item.quantity}</span>
            <strong>{formatRupiah(item.unitPrice * item.quantity)}</strong>
          </div>
        ))}
        <div className="summary-row summary-total"><span>Estimasi Total</span><strong>{formatRupiah(estimate)}</strong></div>
        <p className="summary-note">Harga ini berasal dari katalog browser dan hanya perkiraan. Server memvalidasi ulang.</p>
        <Link href="/keranjang" className="text-link">Kembali ke keranjang</Link>
      </aside>
    </div>
  );
}
