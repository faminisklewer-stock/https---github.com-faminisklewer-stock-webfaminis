import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Informasi data yang digunakan Faminis Barokah untuk menangani permintaan pesanan.",
  alternates: { canonical: "/kebijakan-privasi" },
  robots: { index: false, follow: false },
  openGraph: { title: "Kebijakan Privasi Faminis Barokah", description: "Cara data permintaan pesanan digunakan pada website Faminis Barokah.", url: `${siteUrl}/kebijakan-privasi` },
  twitter: { card: "summary", title: "Kebijakan Privasi Faminis Barokah", description: "Cara data permintaan pesanan digunakan pada website Faminis Barokah." },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Kebijakan Privasi"
      description="Kebijakan ini menjelaskan data yang diminta saat mengirim permintaan pesanan di website Faminis Barokah."
      path="/kebijakan-privasi"
      sections={[
        {
          title: "Data yang diminta",
          paragraphs: ["Form permintaan pesanan meminta nama, nomor WhatsApp, dan alamat pengiriman. Email bersifat opsional."],
        },
        {
          title: "Penggunaan data",
          paragraphs: ["Data pesanan digunakan untuk memeriksa ketersediaan produk, menghubungi pelanggan, dan menangani permintaan tersebut."],
        },
        {
          title: "Penyimpanan dan pertanyaan",
          paragraphs: ["Data disimpan pada layanan database Supabase yang dikonfigurasi oleh pengelola Faminis Barokah. Untuk pertanyaan tentang data atau permintaan perubahan, hubungi Admin melalui halaman Kontak."],
        },
      ]}
    />
  );
}
