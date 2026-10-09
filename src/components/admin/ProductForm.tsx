import type { Category, Product, ProductImage } from "@/types/database";
import { ImageUploader } from "./ImageUploader";

export function ProductForm({
  categories,
  product,
  image,
  action,
}: {
  categories: Category[];
  product?: Product;
  image?: ProductImage | null;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="admin-form admin-product-form">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <fieldset className="admin-form-section">
        <legend>Informasi produk</legend>
        <p className="form-help">Nama dan kategori membantu pelanggan menemukan produk.</p>
        <div className="field-grid">
          <label className="field-label">Nama produk<input name="name" defaultValue={product?.name} required minLength={2} maxLength={180} /></label>
          <label className="field-label">Slug URL<input name="slug" defaultValue={product?.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
          <label className="field-label">SKU<input name="sku" defaultValue={product?.sku} required minLength={2} maxLength={80} /></label>
          <label className="field-label">Kategori
            <select name="category_id" defaultValue={product?.category_id ?? ""} required>
              <option value="" disabled>Pilih kategori</option>
              {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
            </select>
          </label>
        </div>
        <label className="field-label">Deskripsi singkat<textarea name="short_description" maxLength={300} defaultValue={product?.short_description ?? ""} /></label>
        <label className="field-label">Deskripsi produk<textarea name="description" maxLength={10000} defaultValue={product?.description ?? ""} /></label>
      </fieldset>
      <fieldset className="admin-form-section">
        <legend>Harga dan stok katalog</legend>
        <div className="field-grid">
          <label className="field-label">Harga ecer<input name="ecer_price" type="number" min="0" step="1" defaultValue={product?.ecer_price} required /></label>
          <label className="field-label">Harga grosir, opsional<input name="grosir_price" type="number" min="0" step="1" defaultValue={product?.grosir_price ?? ""} /></label>
          <label className="field-label">Minimum grosir<input name="grosir_min_qty" type="number" min="1" max="99" defaultValue={product?.grosir_min_qty ?? 1} required /></label>
          <label className="field-label">Status stok katalog
            <select name="stock_status" defaultValue={product?.stock_status ?? "CONFIRM"}>
              <option value="CONFIRM">Perlu konfirmasi</option>
              <option value="AVAILABLE">Tersedia menurut katalog</option>
              <option value="LOW_STOCK">Stok menipis</option>
              <option value="OUT_OF_STOCK">Habis</option>
            </select>
          </label>
        </div>
        <p className="form-help">Informasi stok pada katalog bukan jaminan jumlah stok fisik.</p>
      </fieldset>
      <fieldset className="admin-form-section">
        <legend>Foto produk</legend>
        <ImageUploader bucket="product-images" initialUrl={image?.image_url} />
        <label className="field-label">Alt foto<input name="image_alt" maxLength={250} defaultValue={image?.alt_text ?? ""} placeholder="Jelaskan foto produk secara singkat" /></label>
      </fieldset>
      <details className="admin-form-section admin-optional-section">
        <summary>Pengaturan SEO (opsional)</summary>
        <div className="admin-form">
          <label className="field-label">SEO title<input name="seo_title" maxLength={180} defaultValue={product?.seo_title ?? ""} /></label>
          <label className="field-label">Meta description<textarea name="seo_description" maxLength={320} defaultValue={product?.seo_description ?? ""} /></label>
          <label className="field-label">Focus keyword<input name="focus_keyword" maxLength={100} defaultValue={product?.focus_keyword ?? ""} /></label>
          <label className="field-label">Canonical URL<input name="canonical_url" type="url" defaultValue={product?.canonical_url ?? ""} /></label>
          <label className="field-label">OG image URL<input name="og_image" type="url" defaultValue={product?.og_image ?? ""} /></label>
        </div>
      </details>
      <fieldset className="admin-form-section">
        <legend>Tampilan katalog</legend>
        <div className="admin-checks">
          <label><input name="is_active" type="checkbox" defaultChecked={product?.is_active ?? false} /> Tampilkan di katalog</label>
          <label><input name="is_featured" type="checkbox" defaultChecked={product?.is_featured ?? false} /> Produk pilihan</label>
          <label><input name="is_best_seller" type="checkbox" defaultChecked={product?.is_best_seller ?? false} /> Terlaris</label>
        </div>
      </fieldset>
      <div className="admin-form-submit">
        <p className="form-help">Harga dan informasi stok akan diperiksa kembali sebelum pesanan diproses.</p>
        <button className="button button-primary" type="submit">{product ? "Simpan perubahan" : "Tambah produk"}</button>
      </div>
    </form>
  );
}
