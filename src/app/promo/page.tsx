import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicSupabaseClient } from "@/lib/supabase/config";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Promo",
  description: "Lihat promo dan informasi terbaru dari Faminis Barokah.",
  alternates: { canonical: "/promo" },
  openGraph: {
    title: "Promo Faminis Barokah",
    description: "Lihat promo dan informasi terbaru dari Faminis Barokah.",
    url: `${siteUrl}/promo`,
  },
  twitter: {
    card: "summary",
    title: "Promo Faminis Barokah",
    description: "Lihat promo dan informasi terbaru dari Faminis Barokah.",
  },
};

export default async function PromoPage() {
  const supabase = getPublicSupabaseClient();
  let promos: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    destination_url: string;
  }[] = [];
  let loadError = false;
  if (!supabase) {
    loadError = true;
  } else {
    const result = await supabase.from("promo_cards")
      .select("id, title, description, image_url, destination_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (result.error) {
      console.error("Public promo cards could not be loaded.", result.error);
      loadError = true;
    } else {
      promos = result.data;
    }
  }

  return (
    <main className="promo-page wrap">
      <header className="promo-page-heading">
        <p className="section-eyebrow">Faminis Barokah</p>
        <h1>Promo dan komunitas</h1>
        <p>Informasi promo dan program yang sedang dibagikan oleh Faminis Barokah.</p>
      </header>
      {loadError ? (
        <section className="promo-empty-state" role="alert">
          <h2>Promo belum dapat dimuat</h2>
          <p>Periksa koneksi, lalu coba muat halaman ini kembali.</p>
          <form action="/promo" method="get">
            <button className="button button-secondary" type="submit">Muat ulang</button>
          </form>
        </section>
      ) : promos.length ? (
        <div className="promo-cards">
          {promos.map((promo) => (
            <article className="promo-card" key={promo.id}>
              <div className={`promo-card-artwork${promo.image_url ? "" : " promo-card-artwork-empty"}`}>
                {promo.image_url ? (
                  <Image
                    src={promo.image_url}
                    alt={promo.title}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 600px"
                  />
                ) : (
                  <span>Promo Faminis Barokah</span>
                )}
              </div>
              <div className="promo-card-content">
                <div>
                  <h2>{promo.title}</h2>
                  {promo.description ? <p>{promo.description}</p> : null}
                </div>
                <a className="button button-primary promo-card-action" href={promo.destination_url} target="_blank" rel="noopener noreferrer">
                  Lihat Detail Promo
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="promo-empty-state" aria-live="polite">
          <h2>Belum ada promo yang ditayangkan</h2>
          <p>Silakan lihat produk yang tersedia. Promo baru akan muncul di halaman ini saat diterbitkan.</p>
          <Link className="button button-primary" href="/produk">Lihat produk</Link>
        </section>
      )}
    </main>
  );
}
