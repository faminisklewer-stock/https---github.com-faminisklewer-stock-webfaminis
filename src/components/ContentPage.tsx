import Link from "next/link";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { siteUrl } from "@/lib/site";

type ContentSection = { title: string; paragraphs: string[]; items?: string[] };

export function ContentPage({
  title,
  description,
  path,
  sections,
}: {
  title: string;
  description: string;
  path: string;
  sections: ContentSection[];
}) {
  const url = `${siteUrl}${path}`;
  return (
    <div className="page-wrap site-page">
      <SeoJsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
          { "@type": "ListItem", position: 2, name: title, item: url },
        ],
      }} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Beranda</Link><span>/</span><span>{title}</span>
      </nav>
      <p className="section-eyebrow">Faminis Barokah</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.items ? <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
        </section>
      ))}
    </div>
  );
}
