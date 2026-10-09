import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Informasi Reseller",
  description: "Informasi harga grosir dan pilihan produk Faminis Barokah untuk kebutuhan reseller.",
  alternates: { canonical: "/reseller" },
  openGraph: { title: "Informasi Reseller Faminis Barokah", description: "Informasi harga grosir dan pilihan produk untuk kebutuhan reseller.", url: `${siteUrl}/reseller` },
  twitter: { card: "summary", title: "Informasi Reseller Faminis Barokah", description: "Informasi harga grosir dan pilihan produk untuk kebutuhan reseller." },
};

export default function ResellerPage() {
  return (
    <>
      <ContentPage
        title="Informasi Reseller"
        description="Pilihan produk fashion muslim untuk pembelian ecer maupun grosir."
        path="/reseller"
        sections={[
          {
            title: "Harga dan minimum pembelian",
            paragraphs: [
              "Harga grosir dan jumlah minimum dapat berbeda untuk tiap produk. Periksa informasi pada detail produk atau tanyakan kepada Admin.",
              "Stok, motif, warna, dan ukuran perlu dikonfirmasi sebelum pembayaran.",
            ],
          },
          {
            title: "Pertanyaan reseller",
            paragraphs: ["Hubungi Admin untuk menanyakan pilihan grosir dan ketentuan pembelian reseller yang berlaku."],
          },
        ]}
      />
      <div className="page-wrap site-page contact-page-action">
        <Link href="/kontak" className="button button-primary">Hubungi Admin</Link>
      </div>
    </>
  );
}
