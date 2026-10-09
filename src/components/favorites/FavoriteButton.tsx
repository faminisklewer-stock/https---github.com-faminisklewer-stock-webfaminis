"use client";

import { useState } from "react";
import { useFavorites } from "./FavoritesProvider";

export function FavoriteButton({ productId }: { productId: string }) {
  const { productIds, toggle } = useFavorites();
  const [error, setError] = useState("");
  const active = productIds.includes(productId);

  async function handleToggle() {
    setError("");
    try {
      await toggle(productId);
    } catch (caught) {
      console.error("Favorite could not be updated.", caught);
      setError("Favorit belum tersimpan. Coba lagi.");
    }
  }

  return (
    <div className="favorite-control">
      <button
        className={`favorite-button${active ? " is-active" : ""}`}
        type="button"
        aria-pressed={active}
        aria-label={active ? "Hapus dari favorit" : "Simpan ke favorit"}
        onClick={handleToggle}
      >
        {active ? "Tersimpan" : "Simpan"}
      </button>
      {error ? <span className="favorite-error" role="alert">{error}</span> : null}
    </div>
  );
}
