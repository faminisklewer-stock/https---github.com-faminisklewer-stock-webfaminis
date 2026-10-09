import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-wrap page-state">
      <p className="section-eyebrow">404</p>
      <h1>Halaman tidak ditemukan.</h1>
      <p>Alamatnya mungkin berubah atau produk sudah tidak aktif di katalog.</p>
      <Link href="/produk" className="button button-primary">Kembali ke produk</Link>
    </div>
  );
}
