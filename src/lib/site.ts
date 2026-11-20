export const siteUrl =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://faminisbarokah.my.id").replace(/\/$/, "");

export function normalizePublicUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return siteUrl;
  if (trimmed.startsWith("/")) return `${siteUrl}${trimmed}`;

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase();
    const legacyHosts = new Set([
      "localhost",
      "127.0.0.1",
      "faminisweb.vercel.app",
    ]);

    if (legacyHosts.has(hostname) || hostname === "www.faminisbarokah.my.id") {
      return `${siteUrl}${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export const publicStaticPages = [
  { path: "/", priority: 1 },
  { path: "/produk", priority: 0.9 },
  { path: "/promo", priority: 0.7 },
  { path: "/reseller", priority: 0.8 },
  { path: "/kontak", priority: 0.6 },
];
