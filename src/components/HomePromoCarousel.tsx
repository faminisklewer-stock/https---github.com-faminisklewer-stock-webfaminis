"use client";

import Image from "next/image";
import { useEffect, useState, type KeyboardEvent, type TouchEvent } from "react";

export type HomePromoSlide = {
  id: string;
  title: string;
  imageUrl: string;
  destinationUrl: string;
};

export function HomePromoCarousel({
  slides,
  loadState,
}: {
  slides: HomePromoSlide[];
  loadState: "ready" | "error";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || loadState === "error" || paused || focused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [focused, loadState, paused, reducedMotion, slides.length]);

  const slide = slides[activeIndex];
  const moveSlide = (direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + slides.length) % slides.length);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveSlide(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveSlide(1);
    }
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) >= 40) moveSlide(distance > 0 ? -1 : 1);
    setTouchStart(null);
  };

  if (loadState === "error" || !slide) {
    return (
      <div className="home-promo-carousel home-promo-carousel-hero home-promo-carousel-empty" role={loadState === "error" ? "alert" : "status"}>
        <strong>{loadState === "error" ? "Carousel belum dapat dimuat" : "Belum ada gambar utama"}</strong>
        <p>
          {loadState === "error"
            ? "Periksa koneksi atau pastikan migrasi carousel Beranda Supabase sudah dijalankan."
            : "Admin dapat menambahkan gambar utama melalui menu Carousel Beranda."}
        </p>
      </div>
    );
  }

  return (
    <div
      className="home-promo-carousel home-promo-carousel-hero"
      role="region"
      aria-roledescription="carousel"
      aria-label="Gambar utama Faminis Barokah"
      aria-keyshortcuts="ArrowLeft ArrowRight"
      tabIndex={slides.length > 1 ? 0 : undefined}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="home-promo-carousel-slide"
        role="group"
        aria-roledescription="slide"
        aria-label={`${activeIndex + 1} dari ${slides.length}: ${slide.title}`}
      >
        <a
          className="home-promo-carousel-link"
          href={slide.destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Buka ${slide.title}`}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 45vw, 650px"
          />
          <span className="home-promo-carousel-caption">
            <span className="home-promo-carousel-kicker">Faminis Barokah</span>
            <span className="home-promo-carousel-title">{slide.title}</span>
          </span>
        </a>
      </div>
    </div>
  );
}
