"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function signOut() {
    setError("");
    try {
      const { error: signOutError } = await getBrowserSupabaseClient().auth.signOut();
      if (signOutError) {
        console.error("Supabase sign-out failed.", signOutError);
        setError("Belum berhasil keluar. Coba lagi.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch (caught) {
      console.error("Sign-out could not be completed.", caught);
      setError("Layanan akun belum tersedia.");
    }
  }

  return (
    <div>
      <button className="button button-secondary" type="button" onClick={signOut}>Keluar</button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
