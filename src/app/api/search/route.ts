import { getProducts } from "@/lib/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (query.length < 2) return Response.json({ suggestions: [] });
  if (!isSupabaseConfigured()) return Response.json({ suggestions: [] });

  try {
    const products = await getProducts({ search: query, limit: 6 });
    return Response.json({
      suggestions: products.map((product) => ({
        name: product.name,
        slug: product.slug,
        category: product.categories?.name ?? null,
      })),
    }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Product suggestions could not be loaded.", error);
    return Response.json({ error: "Saran pencarian belum tersedia." }, { status: 503 });
  }
}
