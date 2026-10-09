export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://faminisbarokah.my.id";

export const publicStaticPages = [
  { path: "/", priority: 1 },
  { path: "/produk", priority: 0.9 },
  { path: "/promo", priority: 0.7 },
  { path: "/reseller", priority: 0.8 },
  { path: "/kontak", priority: 0.6 },
];
