import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/keranjang", "/akun", "/api/private"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
