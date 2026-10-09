import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Daftar Gratis", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return (
    <div className="page-wrap auth-page">
      <div className="auth-content">
        <header className="auth-heading">
          <h1>Buat akun pelanggan</h1>
          <p>Akun membantu menyimpan riwayat pesanan. Anda tetap bisa belanja dan memesan tanpa mendaftar.</p>
        </header>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
