"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

const storageKey = "faminis-barokah-favorites";
type FavoritesValue = {
  productIds: string[];
  ready: boolean;
  toggle: (productId: string) => Promise<void>;
};
const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        if (Array.isArray(parsed)) {
          setProductIds(parsed.filter((id): id is string => typeof id === "string"));
        }
      } catch (error) {
        console.error("Favorit lokal tidak dapat dibaca.", error);
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify(productIds));
  }, [productIds, ready]);

  useEffect(() => {
    if (!ready || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return;
    let cancelled = false;
    const loadMemberFavorites = async () => {
      try {
        const client = getBrowserSupabaseClient();
        const { data: auth, error: authError } = await client.auth.getUser();
        if (authError && authError.name !== "AuthSessionMissingError") throw authError;
        if (!auth.user) return;
        const { data: profile, error: profileError } = await client
          .from("profiles").select("member_status").eq("id", auth.user.id).maybeSingle();
        if (profileError) throw profileError;
        if (profile?.member_status !== "ACTIVE") return;
        const { data, error } = await client.from("favorites").select("product_id");
        if (error) throw error;
        if (!cancelled) {
          const remote = (data ?? []).map((favorite) => favorite.product_id);
          setProductIds((current) => [...new Set([...current, ...remote])]);
        }
      } catch (error) {
        console.error("Member favorites could not be loaded.", error);
      }
    };
    void loadMemberFavorites();
    return () => { cancelled = true; };
  }, [ready]);

  const toggle = useCallback(async (productId: string) => {
    const configured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const client = configured ? getBrowserSupabaseClient() : null;
    const { data: auth, error: authError } = client
      ? await client.auth.getUser()
      : { data: { user: null }, error: null };
    if (authError && authError.name !== "AuthSessionMissingError") throw authError;

    if (auth.user && client) {
      const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("member_status")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      if (profile?.member_status === "ACTIVE") {
        const { data: existing, error: readError } = await client
          .from("favorites").select("id").eq("product_id", productId).maybeSingle();
        if (readError) throw readError;
        const result = existing
          ? await client.from("favorites").delete().eq("id", existing.id)
          : await client.from("favorites").insert({ product_id: productId, user_id: auth.user.id });
        if (result.error) throw result.error;
        setProductIds((current) => existing
          ? current.filter((id) => id !== productId)
          : current.includes(productId) ? current : [...current, productId]);
        return;
      }
    }

    setProductIds((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]);
  }, []);

  const value = useMemo(() => ({ productIds, ready, toggle }), [productIds, ready, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites harus digunakan di dalam FavoritesProvider.");
  return context;
}
