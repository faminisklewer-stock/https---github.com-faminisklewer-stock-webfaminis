import Link from "next/link";
import { BrandSymbol } from "@/components/BrandSymbol";
import { CustomerAuthForm } from "@/components/auth/AuthForm";

export default function CustomerLoginPage() {
  return (
    <main className="customer-auth-page" id="konten-utama">
      <div className="customer-auth-layout">
        <aside className="customer-auth-aside" aria-label="Informasi member">
          <BrandSymbol />
          <p className="section-eyebrow">Area member</p>
          <h2>Poin dan pembelian tersimpan dalam satu tempat.</h2>
          <ul>
            <li><strong>Saldo poin</strong><span>Pantau jumlah poin yang siap ditukarkan</span></li>
            <li><strong>Voucher belanja</strong><span>Kelola voucher Rp10.000 hasil penukaran poin</span></li>
            <li><strong>Riwayat transaksi</strong><span>Lihat produk, jumlah, tanggal, dan total belanja</span></li>
          </ul>
        </aside>
        <section className="customer-auth-card" aria-labelledby="login-title">
          <p className="section-eyebrow">Selamat datang kembali</p>
          <h1 id="login-title">Masuk ke akun</h1>
          <p className="customer-auth-lead">Poin berlaku untuk pembelian online maupun offline. Anda perlu memiliki akun website Faminis Barokah sebelum berbelanja. Untuk transaksi offline, sampaikan email akun kepada Admin agar pembelian dapat dicatat.</p>
          <CustomerAuthForm mode="login" />
          <p className="customer-auth-switch">Belum punya akun? <Link href="/register">Daftar member</Link></p>
        </section>
      </div>
    </main>
  );
}
