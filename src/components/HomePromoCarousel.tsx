"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type HomePromoSlide = {
  id: string;
  title: string;
  imageUrl: string;
  destinationUrl: string;
};

type CarouselContextValue = {
  slides: HomePromoSlide[];
  activeIndex: number;
  loadState: "ready" | "error";
  paused: boolean;
  setActiveIndex: (index: number) => void;
  setPaused: (paused: boolean) => void;
  setFocused: (focused: boolean) => void;
  reducedMotion: boolean;
};

const HomePromoCarouselContext = createContext<CarouselContextValue | null>(null);

export function HomePromoCarouselProvider({
  slides,
  loadState,
  children,
}: {
  slides: HomePromoSlide[];
  loadState: "ready" | "error";
  children: ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

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
    }, 3000);

    return () => window.clearInterval(timer);
  }, [focused, loadState, paused, reducedMotion, slides.length]);

  return (
    <HomePromoCarouselContext.Provider
      value={{ slides, activeIndex, loadState, paused, setActiveIndex, setPaused, setFocused, reducedMotion }}
    >
      {children}
    </HomePromoCarouselContext.Provider>
  );
}

export function HomePromoCarousel({ placement }: { placement: "hero" | "section" }) {
  const carousel = useContext(HomePromoCarouselContext);
  if (!carousel) throw new Error("HomePromoCarousel must be rendered inside its provider.");

  const { slides, activeIndex, loadState, paused, setActiveIndex, setPaused, setFocused, reducedMotion } = carousel;
  const regionLabel = placement === "hero" ? "Promo Faminis Barokah" : "Produk terbaru dan promo";
  const slide = slides[activeIndex];
  const moveSlide = (direction: number) => {
    setActiveIndex((activeIndex + direction + slides.length) % slides.length);
  };

  if (loadState === "error" || !slide) {
    return (
      <div
        className={`home-promo-carousel home-promo-carousel-${placement} home-promo-carousel-empty`}
        role={loadState === "error" ? "alert" : "status"}
      >
        <strong>{loadState === "error" ? "Carousel belum dapat dimuat" : "Belum ada promo yang ditayangkan"}</strong>
        <p>
          {loadState === "error"
            ? "Periksa koneksi atau pastikan migrasi Promo Supabase sudah dijalankan."
            : "Gambar promo Beranda dapat ditambahkan Admin melalui menu Promo."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`home-promo-carousel home-promo-carousel-${placement}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={regionLabel}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
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
            sizes={placement === "hero"
              ? "(max-width: 768px) 100vw, (max-width: 1100px) 45vw, 650px"
              : "(max-width: 768px) 100vw, 1200px"}
          />
          <span className="home-promo-carousel-caption">
            <span className="home-promo-carousel-kicker">Promo Faminis Barokah</span>
            <span className="home-promo-carousel-title">{slide.title}</span>
          </span>
        </a>
      </div>

      {slides.length > 1 ? (
        <div className="home-promo-carousel-controls" aria-label="Kontrol carousel">
          <button type="button" onClick={() => moveSlide(-1)} aria-label="Slide sebelumnya">
            <span aria-hidden="true">‹</span>
          </button>
          <span className="home-promo-carousel-count" aria-live="off">{activeIndex + 1} / {slides.length}</span>
          <button type="button" onClick={() => moveSlide(1)} aria-label="Slide berikutnya">
            <span aria-hidden="true">›</span>
          </button>
          {!reducedMotion ? (
            <button
              className="home-promo-carousel-toggle"
              type="button"
              onClick={() => {
                setPaused(!paused);
                if (paused) setFocused(false);
              }}
              aria-label={paused ? "Putar carousel otomatis" : "Jeda carousel otomatis"}
            >
              {paused ? "Putar" : "Jeda"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
