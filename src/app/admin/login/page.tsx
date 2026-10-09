import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="admin-login-page">
      <a className="skip-link" href="#konten-utama">Lewati ke konten</a>
      <main className="admin-login-card" id="konten-utama">
        <Link className="admin-login-brand" href="/" aria-label="Faminis Barokah, kembali ke toko">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>Faminis Barokah<small>Panel Admin</small></span>
        </Link>
        <h1>Masuk ke panel admin</h1>
        <p className="admin-login-description">Gunakan akun yang memiliki akses admin untuk mengelola toko.</p>
        {error === "forbidden" ? (
          <p className="form-error" role="alert">Akun ini tidak memiliki akses admin. Masuk dengan akun admin.</p>
        ) : null}
        <AuthForm mode="login" redirectTo="/admin" audience="admin" />
        <Link className="admin-login-back" href="/">Kembali ke toko</Link>
      </main>
    </div>
  );
}
