import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Panduan Belanja Grosir",
  description: "Panduan memilih produk grosir Faminis Barokah, membaca jumlah minimum, dan meminta konfirmasi stok sebelum pembayaran.",
  alternates: { canonical: "/panduan-grosir" },
  openGraph: { title: "Panduan Belanja Grosir", description: "Cara memesan produk grosir dan mengonfirmasi stok.", url: `${siteUrl}/panduan-grosir` },
  twitter: { card: "summary", title: "Panduan Belanja Grosir", description: "Cara memesan produk grosir dan mengonfirmasi stok." },
};

export default function WholesaleGuidePage() {
  return (
    <ContentPage
      title="Panduan Belanja Grosir"
      description="Pilih produk yang menyediakan harga grosir dan periksa minimum pembelian yang dicantumkan pada detailnya."
      path="/panduan-grosir"
      sections={[
        {
          title: "Memilih produk grosir",
          paragraphs: [
            "Harga grosir hanya berlaku untuk produk yang menampilkan harga dan jumlah minimum grosir. Jumlah tiap produk dapat berbeda.",
            "Tambahkan produk ke keranjang, isi data kontak, lalu kirim permintaan pesanan melalui WhatsApp Admin.",
          ],
        },
        {
          title: "Konfirmasi sebelum pembayaran",
          paragraphs: [
            "Admin akan memeriksa ulang stok, motif, warna, ukuran, jumlah, dan total akhir pesanan. Jangan melakukan pembayaran sebelum menerima konfirmasi dan instruksi dari Admin.",
          ],
          items: [
            "Harga pada katalog merupakan estimasi sampai Admin mengonfirmasi.",
            "Checkout tidak mengurangi stok dan tidak memproses pembayaran.",
            "Guest dapat mengirim permintaan pesanan tanpa membuat akun.",
          ],
        },
      ]}
    />
  );
}
