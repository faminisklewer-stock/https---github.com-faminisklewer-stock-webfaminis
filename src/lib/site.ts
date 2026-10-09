export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://faminisbarokah.my.id";

export const publicStaticPages = [
  { path: "/", priority: 1 },
  { path: "/produk", priority: 0.9 },
  { path: "/reseller", priority: 0.8 },
  { path: "/tentang-kami", priority: 0.6 },
  { path: "/kontak", priority: 0.6 },
  { path: "/panduan-grosir", priority: 0.6 },
];
