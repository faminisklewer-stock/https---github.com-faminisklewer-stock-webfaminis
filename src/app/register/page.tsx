import Link from "next/link";
import { BrandSymbol } from "@/components/BrandSymbol";
import { CustomerAuthForm } from "@/components/auth/AuthForm";

export default function CustomerRegistrationPage() {
  return (
    <main className="customer-auth-page" id="konten-utama">
      <div className="customer-auth-layout">
        <aside className="customer-auth-aside" aria-label="Manfaat member">
          <BrandSymbol />
          <p className="section-eyebrow">Gabung member</p>
          <h2>Belanja lebih teratur, dapatkan keuntungan.</h2>
          <ul>
            <li><strong>10 poin</strong><span>Setiap pembelian Rp100.000, online maupun offline</span></li>
            <li><strong>Rp10.000</strong><span>Voucher untuk setiap 100 poin</span></li>
            <li><strong>Riwayat jelas</strong><span>Lihat pembelian, poin, dan voucher dalam satu akun</span></li>
          </ul>
        </aside>
        <section className="customer-auth-card" aria-labelledby="register-title">
          <p className="section-eyebrow">Daftar gratis</p>
          <h1 id="register-title">Buat akun member</h1>
          <p className="customer-auth-lead">Poin berlaku untuk belanja online dan offline. Buat akun di website Faminis Barokah sebelum berbelanja. Saat belanja offline, sampaikan email akun Anda kepada Admin agar transaksi dapat dicatat.</p>
          <CustomerAuthForm mode="register" />
          <p className="customer-auth-switch">Sudah punya akun? <Link href="/login">Masuk</Link></p>
        </section>
      </div>
    </main>
  );
}
