import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { StockNotice } from "@/components/StockNotice";

export const metadata: Metadata = {
  title: "Konfirmasi Pesanan",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="page-wrap">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Beranda</Link><span>/</span><Link href="/keranjang">Keranjang</Link><span>/</span><span>Konfirmasi pesanan</span>
      </nav>
      <p className="section-eyebrow">Permintaan pesanan</p>
      <h1>Konfirmasi stok dengan Admin</h1>
      <p className="summary-note">Pesanan belum menjadi pembayaran. Admin akan memeriksa stok dan mengirim total akhir melalui WhatsApp.</p>
      <p className="checkout-guest-note">Isi data penerima di bawah untuk mengirim permintaan pesanan kepada Admin melalui WhatsApp.</p>
      <StockNotice />
      <CheckoutForm />
    </div>
  );
}
