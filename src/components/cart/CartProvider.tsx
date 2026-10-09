"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartContextValue, CartItem } from "./types";

const storageKey = "faminis-barokah-cart";
const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.unitPrice === "number" &&
    Number.isInteger(item.quantity) &&
    (item.priceType === "ECER" || item.priceType === "GROSIR")
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed)) setItems(parsed.filter(isCartItem));
        }
      } catch (error) {
        console.error("Keranjang lokal tidak dapat dibaca.", error);
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find(
        (row) => row.productId === item.productId && row.variantId === item.variantId,
      );
      if (existing) {
        return current.map((row) =>
          row === existing ? { ...row, quantity: Math.min(99, row.quantity + item.quantity) } : row,
        );
      }
      return [...current, item];
    });
  }, []);

  const setQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      setItems((current) =>
        current
          .map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity: Math.max(1, Math.min(99, quantity)) }
              : item,
          ),
      );
    },
    [],
  );

  const removeItem = useCallback((productId: string, variantId: string | null) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId || item.variantId !== variantId),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, ready, addItem, setQuantity, removeItem, clearCart }),
    [items, ready, addItem, setQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart harus digunakan di dalam CartProvider.");
  return context;
}
