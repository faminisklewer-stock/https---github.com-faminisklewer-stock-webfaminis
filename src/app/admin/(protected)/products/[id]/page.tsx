import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ProductForm } from "@/components/admin/ProductForm";
import { deleteProduct, deleteProductVariant, saveProductVariant, updateProduct } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";
import type { Category, Product, ProductImage } from "@/types/database";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query, { supabase }] = await Promise.all([params, searchParams, requireAdmin()]);
  const [productResult, categoryResult, imagesResult, variantsResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name, slug, description, image_url, seo_title, seo_description, is_active, created_at, updated_at").order("name"),
    supabase.from("product_images").select("*").eq("product_id", id).order("sort_order").limit(1),
    supabase.from("product_variants").select("*").eq("product_id", id).order("created_at"),
  ]);
  if (productResult.error || categoryResult.error || imagesResult.error || variantsResult.error) {
    throw new Error("Gagal memuat data edit produk.");
  }
  if (!productResult.data) notFound();
  return (
    <main className="admin-page">
      <div className="admin-page-heading"><div><p className="section-eyebrow">Katalog</p><h1>Edit produk</h1></div><Link href="/admin/products" className="text-link">Kembali ke produk</Link></div>
      <AdminFeedback searchParams={query} />
      <ProductForm
        product={productResult.data as Product}
        categories={(categoryResult.data ?? []) as Category[]}
        image={(imagesResult.data?.[0] as ProductImage | undefined) ?? null}
        action={updateProduct}
      />
      <section className="admin-panel">
        <h2>Varian produk</h2>
        <p className="form-help">SKU varian harus unik. Stok varian bersifat informatif dan tetap perlu dikonfirmasi Admin.</p>
        {(variantsResult.data ?? []).map((variant) => (
          <form action={saveProductVariant} className="admin-form variant-form" key={variant.id}>
            <input type="hidden" name="id" value={variant.id} />
            <input type="hidden" name="product_id" value={id} />
            <div className="field-grid">
              <label className="field-label">Nama varian<input name="name" defaultValue={variant.name} required maxLength={120} /></label>
              <label className="field-label">SKU<input name="sku" defaultValue={variant.sku} required maxLength={80} /></label>
              <label className="field-label">Warna<input name="color" defaultValue={variant.color ?? ""} maxLength={80} /></label>
              <label className="field-label">Ukuran<input name="size" defaultValue={variant.size ?? ""} maxLength={80} /></label>
              <label className="field-label">Stok catatan<input name="stock" type="number" min="0" defaultValue={variant.stock ?? ""} /></label>
              <label className="field-label">Tambahan harga<input name="additional_price" type="number" min="0" step="1" defaultValue={variant.additional_price} required /></label>
              <label className="field-label">URL foto varian<input name="image_url" type="url" defaultValue={variant.image_url ?? ""} /></label>
            </div>
            <div className="admin-form-actions">
              <label className="check-label"><input name="is_active" type="checkbox" defaultChecked={variant.is_active} /> Aktif</label>
              <button className="button button-secondary" type="submit">Simpan varian</button>
            </div>
          </form>
        ))}
        <form action={saveProductVariant} className="admin-form variant-form">
          <input type="hidden" name="product_id" value={id} />
          <h3>Tambah varian</h3>
          <div className="field-grid">
            <label className="field-label">Nama varian<input name="name" required maxLength={120} /></label>
            <label className="field-label">SKU<input name="sku" required maxLength={80} /></label>
            <label className="field-label">Warna<input name="color" maxLength={80} /></label>
            <label className="field-label">Ukuran<input name="size" maxLength={80} /></label>
            <label className="field-label">Stok catatan<input name="stock" type="number" min="0" /></label>
            <label className="field-label">Tambahan harga<input name="additional_price" type="number" min="0" step="1" defaultValue="0" required /></label>
            <label className="field-label">URL foto varian<input name="image_url" type="url" /></label>
          </div>
          <label className="check-label"><input name="is_active" type="checkbox" defaultChecked /> Aktif</label>
          <button className="button button-primary" type="submit">Tambah varian</button>
        </form>
        {(variantsResult.data ?? []).map((variant) => (
          <form action={deleteProductVariant} className="admin-delete-form" key={`delete-${variant.id}`}>
            <input type="hidden" name="id" value={variant.id} />
            <input type="hidden" name="product_id" value={id} />
            <button className="admin-row-link danger-link" type="submit">Hapus varian {variant.name}</button>
          </form>
        ))}
      </section>
      <form action={deleteProduct} className="admin-delete-form">
        <input type="hidden" name="id" value={id} />
        <ConfirmSubmitButton message="Hapus produk ini? Riwayat pesanan yang memakai produk dapat mencegah penghapusan.">
          Hapus produk
        </ConfirmSubmitButton>
      </form>
    </main>
  );
}
