import type { MetadataRoute } from "next";
import { getAllActiveSlugs } from "@/lib/catalog";
import { publicStaticPages, siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, products } = await getAllActiveSlugs();
  const staticPages = publicStaticPages.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }));

  return [
    ...staticPages,
    ...categories.map((category) => ({
      url: `${siteUrl}/${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/produk/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
