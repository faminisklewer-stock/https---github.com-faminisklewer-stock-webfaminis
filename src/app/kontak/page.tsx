import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getSiteSettings } from "@/lib/site-settings";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontak Faminis Barokah",
  description: "Hubungi Admin Faminis Barokah untuk menanyakan produk, harga grosir, dan konfirmasi stok.",
  alternates: { canonical: "/kontak" },
  openGraph: { title: "Kontak Faminis Barokah", description: "Tanyakan produk dan konfirmasi stok kepada Admin Faminis Barokah.", url: `${siteUrl}/kontak` },
  twitter: { card: "summary", title: "Kontak Faminis Barokah", description: "Tanyakan produk dan konfirmasi stok kepada Admin Faminis Barokah." },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <ContentPage
        title="Hubungi Faminis Barokah"
        description="Tanyakan ketersediaan stok, pilihan varian, dan pesanan kepada Admin."
        path="/kontak"
        sections={[
          {
            title: "Informasi kontak",
            paragraphs: [
              settings?.address ? `Alamat: ${settings.address}` : "Alamat toko belum dicantumkan.",
              settings?.email ? `Email: ${settings.email}` : "Email belum dicantumkan.",
              "Untuk memastikan stok, hubungi Admin sebelum melakukan pembayaran.",
            ],
          },
        ]}
      />
      <div className="page-wrap site-page contact-page-action">
        <WhatsAppButton
          number={settings?.whatsapp_admin_number}
          message="Halo Admin Faminis Barokah, saya ingin bertanya tentang produk."
        />
      </div>
    </>
  );
}
