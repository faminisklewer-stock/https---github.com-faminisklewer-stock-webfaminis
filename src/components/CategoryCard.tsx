import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/database";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/${category.slug}`} className={`category-card${category.image_url ? " category-card-image" : ""}`}>
      {category.image_url ? (
        <>
          <Image
            src={category.image_url}
            alt={`Koleksi ${category.name} Faminis Barokah`}
            fill
            sizes="(max-width: 720px) 45vw, (max-width: 1100px) 22vw, 250px"
            className="category-image"
          />
          <span className="category-image-overlay" aria-hidden="true" />
        </>
      ) : (
        <span className="category-initial" aria-hidden="true">
          {category.name.slice(0, 1).toLocaleUpperCase("id-ID")}
        </span>
      )}
      <span className="category-name">{category.name}</span>
      <span className="category-caption">Lihat koleksi</span>
    </Link>
  );
}
