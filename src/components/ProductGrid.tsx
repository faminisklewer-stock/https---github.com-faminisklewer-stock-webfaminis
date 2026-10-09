import type { CatalogProduct } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export function ProductGrid({
  products,
  emptyTitle = "Belum ada produk di sini",
  emptyDescription = "Produk akan muncul setelah Admin mengunggah katalog.",
}: {
  products: CatalogProduct[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-rule" aria-hidden="true" />
        <h3>{emptyTitle}</h3>
        <p>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
