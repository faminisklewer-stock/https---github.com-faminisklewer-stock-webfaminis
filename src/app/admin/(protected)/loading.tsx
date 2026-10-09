export default function AdminLoading() {
  return (
    <main className="admin-page" aria-live="polite" aria-busy="true">
      <p className="section-eyebrow">Panel pengelolaan</p>
      <h1>Memuat data admin</h1>
      <p className="admin-loading-message">Tunggu sebentar, data sedang diambil dari toko.</p>
    </main>
  );
}
