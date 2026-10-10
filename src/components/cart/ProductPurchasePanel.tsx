"use client";

import { useMemo, useState } from "react";
import { formatRupiah } from "@/lib/format";
import type { ProductVariant } from "@/types/database";
import { AddToCartButton } from "./AddToCartButton";

export function ProductPurchasePanel({
  product,
  variants,
  grosirPrice,
  grosirMinQty,
  isSample = false,
}: {
  product: { id: string; slug: string; name: string; ecerPrice: number; imageUrl: string | null };
  variants: ProductVariant[];
  grosirPrice: number | null;
  grosirMinQty: number;
  isSample?: boolean;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [priceType, setPriceType] = useState<"ECER" | "GROSIR">("ECER");
  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === variantId) ?? null,
    [variantId, variants],
  );
  const basePrice = priceType === "GROSIR" && grosirPrice !== null ? grosirPrice : product.ecerPrice;
  const price = basePrice + (selectedVariant?.additional_price ?? 0);

  if (isSample) {
    return (
      <div className="purchase-panel">
        <p className="product-sample-note">
          Harga di atas hanya contoh. Produk belum dapat dipesan sampai data katalog resmi tersedia.
        </p>
      </div>
    );
  }

  return (
    <div className="purchase-panel">
      {variants.length ? (
        <label className="field-label">
          Varian
          <select value={variantId} onChange={(event) => setVariantId(event.target.value)}>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {[variant.name, variant.size, variant.color].filter(Boolean).join(" / ")}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {grosirPrice !== null ? (
        <label className="field-label">
          Jenis harga
          <select value={priceType} onChange={(event) => {
            const nextType = event.target.value === "GROSIR" ? "GROSIR" : "ECER";
            setPriceType(nextType);
            if (nextType === "GROSIR") setQuantity((value) => Math.max(value, grosirMinQty));
          }}>
            <option value="ECER">Ecer</option>
            <option value="GROSIR">Grosir, minimum {grosirMinQty} item</option>
          </select>
        </label>
      ) : null}
      <div className="purchase-price">
        <span>Harga {priceType === "GROSIR" ? "grosir" : "ecer"}</span>
        <strong>{formatRupiah(price)}</strong>
        <small>
          {priceType === "GROSIR"
            ? `Minimum ${grosirMinQty} item. Harga final dikonfirmasi Admin.`
            : "Harga final dikonfirmasi Admin sebelum pembayaran."}
        </small>
      </div>
      <div className="purchase-quantity">
        <span>Jumlah</span>
        <div className="quantity-control">
          <button type="button" aria-label="Kurangi jumlah" onClick={() => setQuantity((value) => Math.max(priceType === "GROSIR" ? grosirMinQty : 1, value - 1))}>−</button>
          <span aria-live="polite">{quantity}</span>
          <button type="button" aria-label="Tambah jumlah" onClick={() => setQuantity((value) => Math.min(99, value + 1))}>+</button>
        </div>
      </div>
      <AddToCartButton
        product={product}
        variant={selectedVariant ? {
          id: selectedVariant.id,
          name: [selectedVariant.name, selectedVariant.size, selectedVariant.color].filter(Boolean).join(" / "),
          additionalPrice: selectedVariant.additional_price,
        } : null}
        quantity={quantity}
        priceType={priceType}
        unitPrice={price}
        className="button button-primary button-wide"
      />
    </div>
  );
}
