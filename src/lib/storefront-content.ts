import { unstable_cache } from "next/cache";
import { getPublicSupabaseClient } from "@/lib/supabase/config";
import type { PromoCard, Testimonial } from "@/types/database";

export const storefrontContentCacheTags = {
  home: "storefront-home",
  promos: "storefront-promos",
} as const;

const cacheSeconds = 300;

export const getHomepageContent = unstable_cache(async () => {
  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    return {
      slides: null,
      testimonials: null,
      slidesError: "Supabase is not configured.",
      testimonialsError: "Supabase is not configured.",
    };
  }

  const [slidesResult, testimonialsResult] = await Promise.all([
    supabase
      .from("home_carousel_slides")
      .select("id, title, image_url, destination_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("testimonials")
      .select("id, customer_name, content, sort_order, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
  ]);

  return {
    slides: slidesResult.error ? null : slidesResult.data ?? [],
    testimonials: testimonialsResult.error ? null : testimonialsResult.data as Testimonial[] ?? [],
    slidesError: slidesResult.error?.message ?? null,
    testimonialsError: testimonialsResult.error?.message ?? null,
  };
}, ["storefront-homepage-content-v1"], {
  tags: [storefrontContentCacheTags.home],
  revalidate: cacheSeconds,
});

type PublicPromoCard = Pick<PromoCard, "id" | "title" | "description" | "image_url" | "destination_url">;

export const getPublicPromoCards = unstable_cache(async () => {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return { promos: null, errorMessage: "Supabase is not configured." };

  const { data, error } = await supabase.from("promo_cards")
    .select("id, title, description, image_url, destination_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return {
    promos: error ? null : data as PublicPromoCard[] ?? [],
    errorMessage: error?.message ?? null,
  };
}, ["storefront-promo-cards-v1"], {
  tags: [storefrontContentCacheTags.promos],
  revalidate: cacheSeconds,
});
