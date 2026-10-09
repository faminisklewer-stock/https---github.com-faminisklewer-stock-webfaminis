"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icons";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type AccountState = { id: string; label: string; member: boolean } | null;

export function AccountNav() {
  const [account, setAccount] = useState<AccountState>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return;
    let cancelled = false;
    const supabase = getBrowserSupabaseClient();
    const load = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error && error.name !== "AuthSessionMissingError") throw error;
        if (!cancelled) setAccount(data.user ? { id: data.user.id, label: data.user.email ?? "Akun", member: false } : null);
      } catch (error) {
        console.error("Header could not load the account state.", error);
      }
    };
    void load();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccount(session?.user ? {
        id: session.user.id,
        label: session.user.email ?? "Akun",
        member: false,
      } : null);
    });
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!account?.id || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const { data, error } = await getBrowserSupabaseClient()
          .from("profiles").select("full_name, member_status").eq("id", account.id).maybeSingle();
        if (error) throw error;
        if (!cancelled && data) {
          setAccount((current) => current?.id === account.id
            ? { ...current, label: data.full_name || current.label, member: data.member_status === "ACTIVE" }
            : current);
        }
      } catch (error) {
        console.error("Header could not load member information.", error);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [account?.id]);

  return (
    <Link className="header-action account-link" href="/akun">
      <Icon name="user" />
      <span>{account ? account.label : "Masuk / Daftar"}</span>
      {account?.member ? <small className="header-member-label">MEMBER</small> : null}
    </Link>
  );
}
