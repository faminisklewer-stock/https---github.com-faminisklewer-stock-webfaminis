import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Program Reseller Fashion Muslim Gratis",
  description: "Kenali program reseller Faminis Barokah, cara mendaftar, pilihan fashion muslim grosir, dan akses grup WhatsApp untuk member.",
  alternates: { canonical: "/reseller" },
  openGraph: { title: "Program Reseller Fashion Muslim Gratis", description: "Informasi program reseller Faminis Barokah.", url: `${siteUrl}/reseller` },
  twitter: { card: "summary", title: "Program Reseller Fashion Muslim Gratis", description: "Informasi program reseller Faminis Barokah." },
};

export default function ResellerPage() {
  return (
    <>
      <ContentPage
        title="Program Reseller Faminis Barokah"
        description="Program untuk pelanggan yang ingin menawarkan kembali produk fashion muslim Faminis Barokah."
        path="/reseller"
        sections={[
          {
            title: "Yang tersedia untuk reseller",
            paragraphs: ["Program reseller memberi akses pada informasi produk dan pilihan pembelian grosir. Detail harga dan stok perlu dikonfirmasi kepada Admin."],
            items: [
              "Pendaftaran member gratis.",
              "Kesempatan bergabung ke grup WhatsApp reseller setelah memenuhi status member.",
              "Informasi produk baru dan promo mengikuti pengaturan Admin.",
              "Produk fashion muslim yang dapat ditawarkan kembali.",
            ],
          },
          {
            title: "Cara mendaftar",
            paragraphs: ["Buat akun Faminis Barokah dan pilih jenis pelanggan reseller. Admin akan meninjau status reseller sebelum akses program diberikan."],
          },
          {
            title: "Pertanyaan tentang reseller",
            paragraphs: [
              "Apakah ada biaya daftar? Pendaftaran member dan pengajuan reseller pada website tidak dikenai biaya.",
              "Apakah harga grosir berlaku untuk semua produk? Tidak. Harga grosir dan jumlah minimum ditampilkan per produk jika tersedia.",
              "Apakah stok yang terlihat pasti tersedia? Tidak. Admin mengonfirmasi stok sebelum pembayaran.",
            ],
          },
        ]}
      />
      <div className="page-wrap site-page contact-page-action">
        <Link href="/register" className="button button-primary">Daftar reseller gratis</Link>
        <p>Grup WhatsApp reseller hanya ditampilkan kepada member aktif setelah masuk.</p>
      </div>
    </>
  );
}
