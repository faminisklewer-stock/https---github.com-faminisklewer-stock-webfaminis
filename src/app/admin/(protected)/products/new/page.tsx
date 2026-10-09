import Link from "next/link";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
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
      <div className="admin-page-heading"><div><p className="section-eyebrow">Katalog</p><h1>Tambah produk</h1></div><Link href="/admin/products" className="text-link">Kembali</Link></div>
      <AdminFeedback searchParams={params} />
      {data?.length ? (
        <ProductForm categories={data as Category[]} action={createProduct} />
      ) : (
        <div className="admin-panel"><p>Buat kategori terlebih dahulu sebelum menambahkan produk.</p><Link className="button button-primary" href="/admin/categories">Kelola kategori</Link></div>
      )}
    </main>
  );
}
