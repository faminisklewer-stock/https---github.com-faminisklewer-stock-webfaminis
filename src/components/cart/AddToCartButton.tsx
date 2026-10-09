"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  priceType = "ECER",
  unitPrice,
  className = "button button-primary",
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    ecerPrice: number;
    imageUrl: string | null;
  };
  variant?: { id: string; name: string; additionalPrice: number } | null;
  quantity?: number;
  priceType?: "ECER" | "GROSIR";
  unitPrice?: number;
  className?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function add() {
    addItem({
      productId: product.id,
      variantId: variant?.id ?? null,
      slug: product.slug,
      name: product.name,
      variantName: variant?.name ?? null,
      imageUrl: product.imageUrl,
      unitPrice: unitPrice ?? product.ecerPrice + (variant?.additionalPrice ?? 0),
      quantity,
      priceType,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button type="button" className={className} onClick={add}>
      {added ? "Ditambahkan ke keranjang" : "Tambah ke keranjang"}
    </button>
  );
}
