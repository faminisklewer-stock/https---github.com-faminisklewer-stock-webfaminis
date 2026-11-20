"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function redeemVoucher() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");

  const { data, error } = await supabase.rpc("redeem_member_voucher");
  if (error) redirect(`/akun?error=${encodeURIComponent(error.message)}`);
  redirect(`/akun?voucher=${encodeURIComponent(data ?? "")}`);
}

export async function signOutCustomer() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
