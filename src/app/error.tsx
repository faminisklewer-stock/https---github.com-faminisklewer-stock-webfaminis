"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("The page could not be loaded.", error);
  }, [error]);

  return (
    <div className="page-wrap page-state error-page">
      <p className="section-eyebrow">Terjadi kendala</p>
      <h1>Halaman belum dapat dimuat.</h1>
      <p>Periksa koneksi dan coba lagi. Jika kendala berlanjut, hubungi Admin Faminis Barokah.</p>
      <button type="button" className="button button-primary" onClick={() => reset()}>Coba lagi</button>
    </div>
  );
}
