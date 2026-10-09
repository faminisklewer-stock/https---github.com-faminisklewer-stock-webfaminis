import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Masuk", robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = next?.startsWith("/") && !next.startsWith("//") ? next : "/akun";
  return (
    <div className="page-wrap auth-page">
      <div className="auth-content">
        <header className="auth-heading">
          <h1>Masuk ke akun</h1>
          <p>Lihat riwayat pesanan akun Anda. Untuk memilih produk dan memesan, Anda tidak perlu masuk.</p>
        </header>
        <AuthForm mode="login" redirectTo={redirectTo} />
      </div>
    </div>
  );
}
