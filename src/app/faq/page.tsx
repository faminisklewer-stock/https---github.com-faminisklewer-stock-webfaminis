import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pertanyaan Umum",
  description: "Jawaban tentang belanja ecer, harga grosir, pengecekan stok, dan checkout WhatsApp Faminis Barokah.",
  alternates: { canonical: "/faq" },
  robots: { index: false, follow: false },
  openGraph: { title: "Pertanyaan Umum Faminis Barokah", description: "Informasi belanja, stok, dan pesanan Faminis Barokah.", url: `${siteUrl}/faq` },
  twitter: { card: "summary", title: "Pertanyaan Umum Faminis Barokah", description: "Informasi belanja, stok, dan pesanan Faminis Barokah." },
};

export default function FAQPage() {
  return (
    <ContentPage
      title="Pertanyaan Umum"
      description="Informasi singkat untuk membantu proses memilih produk dan meminta konfirmasi pesanan."
      path="/faq"
      sections={[
        {
          title: "Apakah saya harus membuat akun untuk belanja?",
          paragraphs: ["Tidak. Guest dapat melihat produk, menambahkan produk ke keranjang, dan mengirim permintaan pesanan ke WhatsApp Admin."],
        },
        {
          title: "Apakah stok yang tertulis di website dijamin tersedia?",
          paragraphs: ["Tidak. Stok, motif, warna, dan ukuran dapat berubah. Admin akan memeriksa kembali sebelum pembayaran."],
        },
        {
          title: "Kapan saya melakukan pembayaran?",
          paragraphs: ["Checkout hanya menyimpan permintaan pesanan dan membuka WhatsApp Admin. Tunggu konfirmasi stok, total akhir, serta instruksi pembayaran dari Admin."],
        },
        {
          title: "Bagaimana mengetahui minimum harga grosir?",
          paragraphs: ["Periksa bagian harga grosir pada detail produk. Jika minimum pembelian tidak tercantum, tanyakan langsung kepada Admin."],
        },
      ]}
    />
  );
}
