import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login");

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Admin route could not validate the current session.", authError);
    redirect("/admin/login");
  }
  if (!authData.user) redirect("/admin/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (error) throw new Error(`Gagal memeriksa hak admin: ${error.message}`);
  if (profile?.role !== "ADMIN") redirect("/admin/login?error=forbidden");
  return { supabase, user: authData.user, profile };
}
