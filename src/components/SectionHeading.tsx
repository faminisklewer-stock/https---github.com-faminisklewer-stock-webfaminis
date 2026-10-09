import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "Lihat semua produk",
  id,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2 id={id}>{title}</h2>
      </div>
      {href ? <Link href={href} className="text-link">{linkLabel}</Link> : null}
    </div>
  );
}
