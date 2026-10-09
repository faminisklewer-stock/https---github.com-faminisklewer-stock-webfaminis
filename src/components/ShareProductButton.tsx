"use client";

import { useState } from "react";

export function ShareProductButton({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  const [status, setStatus] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  async function shareProduct() {
    setStatus("");
    setCopiedLink(false);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} | Faminis Barokah`,
          text: `Lihat ${name} di Faminis Barokah`,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Product link could not be shared.", error);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setStatus("Tautan produk berhasil disalin.");
    } catch (error) {
      console.error("Product link could not be copied.", error);
      setStatus(`Salin tautan ini untuk membagikan produk: ${url}`);
    }
  }

  return (
    <div className="product-share">
      <button className="button button-secondary button-wide" type="button" onClick={shareProduct}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.7 10.6 6.6-4.2m-6.6 7 6.6 4.2" />
        </svg>
        Bagikan Produk
      </button>
      {status ? (
        <p className="product-share-status" role="status" aria-live="polite">
          {copiedLink ? <span aria-hidden="true">✓ </span> : null}
          {status}
        </p>
      ) : null}
    </div>
  );
}
