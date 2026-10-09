"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HomeProductSlide = {
  slug: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
};

export function HomeProductCarousel({ slides }: { slides: HomeProductSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused || hovered || focused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [focused, hovered, paused, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="home-carousel-empty">
        <span>Foto produk belum tersedia</span>
        <p>Unggah foto pada produk aktif di Admin untuk menampilkannya di sini.</p>
      </div>
    );
  }

  const slide = slides[activeIndex] ?? slides[0];
  const setRelativeSlide = (direction: number) => {
    setActiveIndex((index) => (index + direction + slides.length) % slides.length);
  };

  return (
    <div
      className="home-product-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Produk terbaru Faminis Barokah"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div key={slide.slug} className="home-carousel-slide" role="group" aria-roledescription="slide" aria-label={`${activeIndex + 1} dari ${slides.length}: ${slide.name}`}>
        <Link className="home-carousel-image-link" href={`/produk/${slide.slug}`} aria-label={`Lihat produk ${slide.name}`}>
          <Image
            src={slide.imageUrl}
            alt={slide.imageAlt || slide.name}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 70vw, 900px"
          />
          <span className="home-carousel-caption">
            <span className="home-carousel-kicker">Produk terbaru</span>
            <span className="home-carousel-title">{slide.name}</span>
          </span>
        </Link>
      </div>

      {slides.length > 1 ? (
        <div className="home-carousel-controls" aria-label="Kontrol carousel">
          <button type="button" onClick={() => setRelativeSlide(-1)} aria-label="Produk sebelumnya">
            <span aria-hidden="true">‹</span>
          </button>
          <span className="home-carousel-count" aria-live="off">{activeIndex + 1} / {slides.length}</span>
          <button type="button" onClick={() => setRelativeSlide(1)} aria-label="Produk berikutnya">
            <span aria-hidden="true">›</span>
          </button>
          <button
            className="home-carousel-toggle"
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Putar carousel otomatis" : "Jeda carousel otomatis"}
          >
            {paused ? "Putar" : "Jeda"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
