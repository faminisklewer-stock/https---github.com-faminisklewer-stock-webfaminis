import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Pemulihan Password", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="page-wrap auth-page">
      <div className="auth-content">
        <header className="auth-heading">
          <h1>Pulihkan password</h1>
          <p>Masukkan email akun untuk meminta instruksi pemulihan.</p>
        </header>
        <AuthForm mode="reset" />
      </div>
    </div>
  );
}
