import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Informasi data yang digunakan Faminis Barokah untuk akun member dan permintaan pesanan.",
  alternates: { canonical: "/kebijakan-privasi" },
  robots: { index: false, follow: false },
  openGraph: { title: "Kebijakan Privasi Faminis Barokah", description: "Cara data akun dan pesanan digunakan pada website Faminis Barokah.", url: `${siteUrl}/kebijakan-privasi` },
  twitter: { card: "summary", title: "Kebijakan Privasi Faminis Barokah", description: "Cara data akun dan pesanan digunakan pada website Faminis Barokah." },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Kebijakan Privasi"
      description="Kebijakan ini menjelaskan data yang diminta saat menggunakan akun dan membuat permintaan pesanan di website Faminis Barokah."
      path="/kebijakan-privasi"
      sections={[
        {
          title: "Data yang diminta",
          paragraphs: ["Form permintaan pesanan meminta nama, nomor WhatsApp, dan alamat pengiriman. Email bersifat opsional untuk guest. Pendaftaran member meminta nama, nomor WhatsApp, email, dan password."],
        },
        {
          title: "Penggunaan data",
          paragraphs: ["Data pesanan digunakan untuk memeriksa ketersediaan dan menghubungi pelanggan tentang permintaan tersebut. Data akun digunakan untuk menyediakan fitur member dan menampilkan riwayat pesanan pada akun yang masuk."],
        },
        {
          title: "Penyimpanan dan pertanyaan",
          paragraphs: ["Data disimpan pada layanan database Supabase yang dikonfigurasi oleh pengelola Faminis Barokah. Untuk pertanyaan tentang data atau permintaan perubahan, hubungi Admin melalui halaman Kontak."],
        },
      ]}
    />
  );
}
