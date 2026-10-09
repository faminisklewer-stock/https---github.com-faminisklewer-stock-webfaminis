"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { formatRupiah } from "@/lib/format";
import { StockNotice } from "@/components/StockNotice";
import { useCart } from "./CartProvider";

export function CartView() {
  const { items, ready, setQuantity, removeItem } = useCart();
  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [items],
  );

  if (!ready) {
    return <div className="page-wrap"><p role="status">Memuat keranjang...</p></div>;
  }
  if (items.length === 0) {
    return (
      <div className="page-wrap cart-page">
        <p className="section-eyebrow">Keranjang</p>
        <h1>Keranjang kamu masih kosong.</h1>
        <p>Pilih produk yang ingin ditanyakan stoknya kepada Admin.</p>
        <Link href="/produk" className="button button-primary">Lihat produk</Link>
      </div>
    );
  }

  return (
    <div className="page-wrap cart-page">
      <p className="section-eyebrow">Keranjang</p>
      <h1>Produk pilihanmu</h1>
      <div className="cart-layout">
        <div className="cart-lines">
          {items.map((item) => (
            <article className="cart-line" key={`${item.productId}-${item.variantId ?? "default"}`}>
              <Link className="cart-line-image" href={`/produk/${item.slug}`}>
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="96px" />
                ) : <span>Foto produk</span>}
              </Link>
              <div className="cart-line-main">
                <Link className="cart-line-name" href={`/produk/${item.slug}`}>{item.name}</Link>
                {item.variantName ? <p>Varian: {item.variantName}</p> : null}
                <p className="cart-line-price">{formatRupiah(item.unitPrice)}</p>
                <div className="quantity-control" aria-label={`Jumlah ${item.name}`}>
                  <button
                    type="button"
                    aria-label={`Kurangi jumlah ${item.name}`}
                    onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)}
                  >−</button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Tambah jumlah ${item.name}`}
                    onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}
                  >+</button>
                </div>
              </div>
              <button
                className="remove-item"
                type="button"
                onClick={() => removeItem(item.productId, item.variantId)}
              >Hapus</button>
            </article>
          ))}
        </div>
        <aside className="cart-summary">
          <h2>Ringkasan estimasi</h2>
          <div className="summary-row"><span>Subtotal</span><strong>{formatRupiah(subtotal)}</strong></div>
          <div className="summary-row summary-total"><span>Estimasi Total</span><strong>{formatRupiah(subtotal)}</strong></div>
          <p className="summary-note">Harga di sini merupakan estimasi. Admin akan memeriksa ulang harga, diskon, dan stok.</p>
          <StockNotice />
          <Link href="/checkout" className="button button-primary button-wide">Lanjutkan ke konfirmasi</Link>
        </aside>
      </div>
    </div>
  );
}
