"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+0-9()\s-]{8,20}$/),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  password_confirmation: z.string(),
  customer_type: z.enum(["ECER", "RESELLER", "GROSIR"]).optional(),
}).refine((data) => data.password === data.password_confirmation, {
  path: ["password_confirmation"],
  message: "Konfirmasi password belum sama.",
});

export function AuthForm({
  mode,
  redirectTo = "/akun",
  audience = "customer",
}: {
  mode: "login" | "register" | "reset";
  redirectTo?: string;
  audience?: "customer" | "admin";
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      if (mode === "login") {
        const parsed = loginSchema.safeParse(values);
        if (!parsed.success) {
          setError("Masukkan email yang benar dan password minimal 8 karakter.");
          return;
        }
        const supabase = getBrowserSupabaseClient();
        const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
        if (authError) {
          setError(authError.message === "Invalid login credentials"
            ? "Email atau password tidak sesuai."
            : "Login belum berhasil. Periksa koneksi lalu coba lagi.");
          return;
        }
        router.push(redirectTo);
        router.refresh();
        return;
      }

      if (mode === "register") {
        const parsed = registerSchema.safeParse(values);
        if (!parsed.success) {
          const issue = parsed.error.issues[0];
          const field = issue?.path[0];
          const fieldMessages: Record<string, string> = {
            full_name: "Masukkan nama lengkap, minimal 2 karakter.",
            phone: "Masukkan nomor WhatsApp yang valid.",
            email: "Masukkan alamat email yang benar.",
            password: issue?.code === "too_big"
              ? "Password maksimal 72 karakter."
              : "Gunakan password minimal 8 karakter.",
          };
          setError(issue?.message === "Konfirmasi password belum sama."
            ? issue.message
            : fieldMessages[String(field)] ?? "Periksa kembali data pendaftaran.");
          return;
        }
        const supabase = getBrowserSupabaseClient();
        const { data, error: authError } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: {
              full_name: parsed.data.full_name,
              phone: parsed.data.phone,
              customer_type: parsed.data.customer_type || "ECER",
            },
            emailRedirectTo: `${window.location.origin}/akun`,
          },
        });
        if (authError) {
          setError("Pendaftaran belum berhasil. Periksa data dan coba lagi.");
          console.error("Supabase sign-up failed.", authError);
          return;
        }
        if (data.session) {
          router.push("/akun");
          router.refresh();
        } else {
          setMessage("Pendaftaran tercatat. Periksa email untuk menyelesaikan konfirmasi akun.");
        }
        return;
      }

      const email = z.string().trim().email().safeParse(values.email);
      if (!email.success) {
        setError("Masukkan alamat email yang terdaftar.");
        return;
      }
      const supabase = getBrowserSupabaseClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.data, {
        redirectTo: `${window.location.origin}/akun`,
      });
      if (authError) {
        setError("Permintaan pemulihan password belum terkirim. Coba lagi nanti.");
        console.error("Password reset request failed.", authError);
        return;
      }
      setMessage("Jika email terdaftar, instruksi pemulihan akan dikirim ke alamat tersebut.");
    } catch (caught) {
      console.error("Auth form could not be submitted.", caught);
      setError("Koneksi layanan belum tersedia. Periksa pengaturan Supabase.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-form-wrap">
      {audience === "customer" ? (
        <p className="auth-guest-prompt">
          Ingin langsung belanja? <Link href="/produk">Lanjutkan tanpa akun</Link>
        </p>
      ) : null}
      <form className="auth-form" onSubmit={handleSubmit} noValidate aria-busy={busy}>
        {mode === "register" ? (
          <>
            <label className="field-label">Nama lengkap<input name="full_name" autoComplete="name" placeholder="Nama sesuai pesanan" required minLength={2} maxLength={120} /></label>
            <label className="field-label">Nomor WhatsApp<input name="phone" type="tel" autoComplete="tel" placeholder="Nomor yang bisa dihubungi" required pattern="[+0-9() -]{8,20}" /></label>
          </>
        ) : null}
        <label className="field-label">Email<input name="email" type="email" autoComplete="email" placeholder="nama@email.com" required /></label>
        {mode !== "reset" ? (
          <label className="field-label">
            Password
            <input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} aria-describedby={mode === "register" ? "password-help" : undefined} required />
            {mode === "register" ? <span className="auth-field-help" id="password-help">Gunakan minimal 8 karakter.</span> : null}
          </label>
        ) : null}
        {mode === "register" ? (
          <label className="field-label">Ulangi password<input name="password_confirmation" type="password" autoComplete="new-password" required minLength={8} /></label>
        ) : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {message ? <p className="form-success" role="status">{message}</p> : null}
        <button type="submit" className="button button-primary button-wide" disabled={busy}>
          {busy ? "Memproses..." : mode === "login" ? "Masuk" : mode === "register" ? "Daftar gratis" : "Kirim instruksi"}
        </button>
        <div className="auth-links">
          {mode === "login" ? (
            <>
              <Link href="/lupa-password">Lupa password?</Link>
              {audience === "customer" ? <Link href="/register">Buat akun</Link> : null}
            </>
          ) : mode === "register" ? <Link href="/login">Sudah punya akun? Masuk</Link> : <Link href="/login">Kembali ke login</Link>}
        </div>
      </form>
    </div>
  );
}
