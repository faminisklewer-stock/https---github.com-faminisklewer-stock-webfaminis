import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Kenali Faminis Barokah, supplier dan grosir fashion muslim dari Surakarta yang melayani pembelian ecer maupun grosir.",
  alternates: { canonical: "/tentang-kami" },
  openGraph: { title: "Tentang Faminis Barokah", description: "Supplier dan grosir fashion muslim dari Surakarta.", url: `${siteUrl}/tentang-kami` },
  twitter: { card: "summary", title: "Tentang Faminis Barokah", description: "Supplier dan grosir fashion muslim dari Surakarta." },
};

export default function AboutPage() {
  return (
    <ContentPage
      title="Tentang Faminis Barokah"
      description="Faminis Barokah adalah supplier dan grosir fashion muslim dari Surakarta. Katalog melayani pembeli ecer, reseller, dan pemilik toko."
      path="/tentang-kami"
      sections={[
        {
          title: "Fashion muslim untuk kebutuhan yang berbeda",
          paragraphs: [
            "Katalog Faminis Barokah mencakup daster, mukena, gamis, sarung, setelan, kaftan, sajadah, baju koko, dan produk fashion muslim lainnya.",
            "Pembeli dapat memilih produk untuk pemakaian pribadi atau menanyakan pilihan grosir untuk kebutuhan usaha.",
          ],
        },
        {
          title: "Pengecekan stok sebelum pembayaran",
          paragraphs: [
            "Informasi stok pada website bukan jaminan jumlah fisik. Motif, warna, dan ukuran dapat berubah, jadi Admin akan memeriksa pesanan sebelum memberi informasi pembayaran.",
          ],
        },
      ]}
    />
  );
}
