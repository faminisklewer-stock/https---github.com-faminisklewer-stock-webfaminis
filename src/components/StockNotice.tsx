export function StockNotice() {
  return (
    <aside className="stock-notice" aria-label="Informasi konfirmasi stok">
      <span className="stock-notice-mark" aria-hidden="true">i</span>
      <div>
        <strong>Konfirmasi Stok</strong>
        <p>
          Stok, motif, warna, dan ukuran dapat berubah. Tanyakan ketersediaannya
          kepada Admin sebelum pembayaran.
        </p>
      </div>
    </aside>
  );
}
