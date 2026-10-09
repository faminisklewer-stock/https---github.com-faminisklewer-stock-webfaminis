import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/database";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/${category.slug}`} className="category-card">
      <span className="category-thumb" aria-hidden="true">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt=""
            fill
            sizes="68px"
            className="category-image"
          />
        ) : (
          <span>{category.name.slice(0, 1).toLocaleUpperCase("id-ID")}</span>
        )}
      </span>
      <span className="category-name">{category.name}</span>
    </Link>
  );
}
