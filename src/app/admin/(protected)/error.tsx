"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Admin route failed to render.", error);
  }, [error]);

  return (
    <main className="admin-page">
      <section className="admin-state-panel" role="alert">
        <p className="section-eyebrow">Data belum termuat</p>
        <h1>Halaman admin mengalami kendala</h1>
        <p>Periksa koneksi, lalu coba muat kembali halaman ini.</p>
        <button className="button button-primary" onClick={() => retry()}>Coba lagi</button>
      </section>
    </main>
  );
}
