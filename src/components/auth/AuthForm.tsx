"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { z } from "zod";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export function AdminLoginForm({ redirectTo = "/admin" }: { redirectTo?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const parsed = adminLoginSchema.safeParse(values);
      if (!parsed.success) {
        setError("Masukkan email yang benar dan password minimal 6 karakter.");
        return;
      }

      const { error: authError } = await getBrowserSupabaseClient().auth.signInWithPassword(parsed.data);
      if (authError) {
        setError(authError.message === "Invalid login credentials"
          ? "Email atau password tidak sesuai."
          : "Login belum berhasil. Periksa koneksi lalu coba lagi.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (caught) {
      console.error("Admin login could not be submitted.", caught);
      setError("Koneksi layanan belum tersedia. Periksa pengaturan Supabase.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate aria-busy={busy}>
      <label className="field-label">
        Email
        <input name="email" type="email" autoComplete="email" placeholder="nama@email.com" required />
      </label>
      <label className="field-label">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={6}
          aria-describedby="admin-password-help"
          required
        />
        <span className="auth-field-help" id="admin-password-help">Minimal 6 karakter.</span>
      </label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button type="submit" className="button button-primary button-wide" disabled={busy}>
        {busy ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
