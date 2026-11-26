import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteChrome } from "@/components/SiteChrome";
import { CartProvider } from "@/components/cart/CartProvider";
import { normalizePublicUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "https://faminisbarokah.my.id");
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Faminis Barokah | Supplier Mukena & Daster Solo",
    template: "%s | Faminis Barokah",
  },
  description:
    "Faminis Barokah adalah supplier mukena dan daster di Surakarta (Solo), melayani pembelian ecer dan grosir serta menyediakan pilihan oleh-oleh dari Kota Solo.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Faminis Barokah",
    title: "Faminis Barokah | Supplier Fashion Muslim Ecer & Grosir",
    description:
      "Temukan fashion muslim untuk kebutuhan pribadi, toko, dan reseller.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Faminis Barokah | Supplier Fashion Muslim Ecer & Grosir",
    description:
      "Temukan fashion muslim untuk kebutuhan pribadi, toko, dan reseller.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <CartProvider>
          <SiteChrome
            header={<SiteHeader />}
            footer={<SiteFooter />}
          >
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
