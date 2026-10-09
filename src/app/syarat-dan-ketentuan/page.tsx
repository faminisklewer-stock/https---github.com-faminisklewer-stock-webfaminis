import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description: "Ketentuan katalog, permintaan pesanan, konfirmasi stok, dan pembayaran di Faminis Barokah.",
  alternates: { canonical: "/syarat-dan-ketentuan" },
  robots: { index: false, follow: false },
  openGraph: { title: "Syarat dan Ketentuan Faminis Barokah", description: "Ketentuan penggunaan katalog dan permintaan pesanan Faminis Barokah.", url: `${siteUrl}/syarat-dan-ketentuan` },
  twitter: { card: "summary", title: "Syarat dan Ketentuan Faminis Barokah", description: "Ketentuan penggunaan katalog dan permintaan pesanan Faminis Barokah." },
};

export default function TermsPage() {
  return (
    <ContentPage
      title="Syarat dan Ketentuan"
      description="Ketentuan penggunaan katalog dan pengiriman permintaan pesanan melalui website Faminis Barokah."
      path="/syarat-dan-ketentuan"
      sections={[
        {
          title: "Informasi produk dan harga",
          paragraphs: ["Informasi harga pada katalog menjadi estimasi sampai Admin memeriksa produk dan pesanan. Harga ecer, grosir, dan minimum pembelian dapat berbeda antarproduk."],
        },
        {
          title: "Permintaan pesanan",
          paragraphs: ["Pesanan yang dikirim melalui website berstatus menunggu konfirmasi stok. Permintaan tersebut bukan bukti pembayaran dan tidak mengurangi stok."],
        },
        {
          title: "Konfirmasi dan pembayaran",
          paragraphs: ["Pelanggan perlu menunggu Admin mengonfirmasi produk, varian, jumlah, total akhir, dan langkah pembayaran. Jangan melakukan pembayaran sebelum menerima instruksi dari Admin."],
        },
      ]}
    />
  );
}
