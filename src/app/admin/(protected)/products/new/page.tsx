import Link from "next/link";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import { createProduct } from "@/app/admin/actions";
import type { Category } from "@/types/database";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data, error } = await supabase.from("categories")
    .select("id, name, slug, description, image_url, seo_title, seo_description, is_active, created_at, updated_at")
    .eq("is_active", true).order("name");
  if (error) throw new Error(`Gagal memuat kategori: ${error.message}`);

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="Katalog"
        title="Tambah produk"
        description="Lengkapi informasi utama agar produk siap ditinjau dan ditampilkan di katalog."
        actions={<Link href="/admin/products" className="text-link">Kembali ke produk</Link>}
      />
      <AdminFeedback searchParams={params} />
      {data?.length ? (
        <ProductForm categories={data as Category[]} action={createProduct} />
      ) : (
        <section className="admin-state-panel">
          <h2>Produk perlu memiliki kategori</h2>
          <p>Buat kategori terlebih dahulu. Setelah tersimpan, kategori akan tersedia di formulir produk.</p>
          <Link className="button button-primary" href="/admin/categories">Kelola kategori</Link>
        </section>
      )}
    </main>
  );
}
