import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = product.product_images[0];
  const stockLabels = {
    AVAILABLE: "Tersedia menurut katalog",
    LOW_STOCK: "Stok menipis",
    OUT_OF_STOCK: "Stok habis",
    CONFIRM: "Stok perlu dikonfirmasi",
  } as const;
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
          {product.isSample ? (
            <span className="product-flag">Contoh</span>
          ) : product.is_best_seller ? (
            <span className="product-flag">Terlaris</span>
          ) : null}
        </Link>
      </div>
      <div className="product-card-copy">
        <Link href={`/${product.categories?.slug ?? "produk"}`} className="product-category">
          {product.categories?.name ?? "Fashion Muslim"}
        </Link>
        <Link href={`/produk/${product.slug}`} className="product-title">{product.name}</Link>
        <div className="product-price">
          <span>{product.isSample ? "Harga ecer (contoh)" : "Harga ecer"}</span>
          <strong>{formatRupiah(product.ecer_price)}</strong>
        </div>
        {product.grosir_price !== null ? (
          <p className="product-wholesale">
            Grosir{product.isSample ? " (contoh)" : ""} {formatRupiah(product.grosir_price)} · min. {product.grosir_min_qty} item
          </p>
        ) : null}
        <p className={`product-stock product-stock-${product.stock_status.toLocaleLowerCase("en-US")}`}>
          {stockLabels[product.stock_status]}
        </p>
        {product.isSample ? (
          <p className="product-sample-note">Contoh katalog, belum dapat dipesan.</p>
        ) : (
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              ecerPrice: product.ecer_price,
              imageUrl: image?.image_url ?? null,
            }}
            className="button button-secondary product-add-button"
          />
        )}
      </div>
    </article>
  );
}
