import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = product.product_images[0];
  return (
    <article className="product-card">
      <div className="product-image-frame">
        <Link className="product-image-link" href={`/produk/${product.slug}`}>
          {image ? (
            <Image
              src={image.image_url}
              alt={image.alt_text || product.name}
              fill
              sizes="(max-width: 720px) 45vw, (max-width: 1100px) 30vw, 270px"
              className="product-image"
            />
          ) : (
            <span className="image-placeholder">
              <span>Foto produk</span>
              <small>Belum diunggah</small>
            </span>
          )}
        </Link>
      </div>
      <div className="product-card-copy">
        <Link href={`/${product.categories?.slug ?? "produk"}`} className="product-category">
          {product.categories?.name ?? "Fashion Muslim"}
        </Link>
        <Link href={`/produk/${product.slug}`} className="product-title">{product.name}</Link>
        <div className="product-price">
          <span>{product.isSample ? "Harga ecer, contoh" : "Harga ecer"}</span>
          <strong>{formatRupiah(product.ecer_price)}</strong>
        </div>
      </div>
    </article>
  );
}
