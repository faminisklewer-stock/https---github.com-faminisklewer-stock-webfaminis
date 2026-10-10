# Faminis Barokah

Marketplace fashion muslim berbasis Next.js App Router, TypeScript, Tailwind CSS, Supabase, dan Vercel. Katalog publik dirender di server. Checkout membuat permintaan pesanan berstatus `WAITING_STOCK_CONFIRMATION`; stok tidak dikurangi dan pembayaran tidak diproses otomatis.

## Persyaratan

- Node.js 20.9 atau lebih baru
- npm
- Project Supabase
- Akun Vercel untuk deployment

## Menjalankan secara lokal

1. Pasang dependency:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env.local`, lalu isi URL dan publishable key dari **Supabase Project Settings → API**. Jangan pernah menaruh `service_role` key di variabel `NEXT_PUBLIC_*` atau di browser.

3. Terapkan migration `supabase/migrations/20261008000000_initial_schema.sql` ke project Supabase, misalnya melalui Supabase CLI:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

   Migration membuat tabel, kebijakan Row Level Security, fungsi harga/order, bucket Storage, serta kategori awal. Jalankan `supabase db push` lagi setelah mengambil migration terbaru, termasuk pengelolaan testimoni pelanggan.

4. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`.

## Menyiapkan toko

1. Daftarkan akun melalui `/register`.
2. Jadikan akun admin secara manual lewat SQL Editor Supabase setelah memastikan UUID akun yang benar:

   ```sql
   update public.profiles
   set role = 'ADMIN'
   where id = 'UUID-AKUN-YANG-DIPERCAYA';
   ```

   Jangan sediakan endpoint publik untuk menaikkan role.
3. Masuk ke `/admin/settings` untuk mengisi nomor WhatsApp Admin, alamat, dan tautan grup reseller. Semua tautan WhatsApp toko memakai nomor yang sama dengan pesan sesuai konteks. Tautan grup hanya dapat dibaca member aktif melalui RPC yang memeriksa hak akses di database; pengaturan lengkap hanya dapat dibaca admin.
4. Tambahkan kategori, produk, harga, beberapa foto, dan varian bila tersedia. Tandai produk terlaris melalui formulir produk agar tampil di Beranda. Produk baru berstatus stok `CONFIRM`; website tidak menjamin ketersediaan stok fisik.
5. Isi `/admin/testimonials` hanya dengan ulasan pelanggan asli yang sudah mendapat izin. Ulasan aktif akan tampil di Beranda setelah alur pemesanan.
6. Bucket `product-images`, `category-images`, `banner-images`, dan `site-assets` dibuat oleh migration. Upload media storefront memerlukan akun admin. Kolom gambar juga menerima tautan berbagi file Google Drive: atur akses menjadi “Siapa saja yang memiliki link”, lalu tempel tautannya di kolom gambar. Jangan gunakan tautan folder; file gambar Drive yang dibagikan publik ditampilkan lewat pratinjau gambar Drive.

## Konfigurasi environment

| Variable | Kegunaan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable/anon key untuk akses yang tetap dibatasi RLS |
| `NEXT_PUBLIC_SITE_URL` | Origin publik kanonis, misalnya `https://faminisbarokah.my.id` |

Jangan menaruh `SUPABASE_SERVICE_ROLE_KEY` di deployment frontend. Semua data sensitif dibatasi oleh RLS dan fungsi database yang memeriksa hak akses.

## Deploy ke Vercel

1. Hubungkan repository ke Vercel dan pilih framework Next.js.
2. Atur tiga environment variable di atas untuk Production, Preview, dan Development sesuai URL masing-masing. `NEXT_PUBLIC_SITE_URL` harus memakai origin produksi untuk production deployment.
3. Deploy. Build command standar adalah `npm run build`.
4. Tambahkan `faminisbarokah.my.id` dan domain `www` (jika dipakai) di Vercel, lalu arahkan DNS sesuai instruksi Vercel.
5. Pastikan callback URL Supabase Auth mencakup domain produksi dan URL preview/dev yang dipakai.

## Validasi

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Pembelian, favorit member, pengaturan admin, serta SSR auth membutuhkan project Supabase dengan migration sudah diterapkan. Tanpa konfigurasi backend, katalog menampilkan satu produk ilustrasi yang diberi label contoh dan tidak dapat dipesan. Produk ini hanya untuk melihat tampilan katalog, bukan data toko atau record Supabase. Jika Supabase sudah dikonfigurasi tetapi katalog belum berisi produk, website menampilkan keadaan kosong. API checkout menolak pembuatan order tanpa backend.
