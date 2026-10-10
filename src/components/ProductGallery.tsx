"use client";

import Image from "next/image";
import { useState, type KeyboardEvent, type TouchEvent } from "react";
import type { ProductImage } from "@/types/database";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const image = images[activeIndex];

  function moveImage(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + images.length) % images.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveImage(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveImage(1);
    }
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart === null) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) >= 40) moveImage(distance > 0 ? -1 : 1);
    setTouchStart(null);
  }

  return (
    <div
      className="product-gallery"
      role="region"
      aria-label={`Foto ${productName}`}
      tabIndex={images.length > 1 ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
    >
      <div className="product-main-image" aria-live="polite">
        {image ? (
          <Image
            src={image.image_url}
            alt={image.alt_text || productName}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 55vw"
          />
        ) : (
          <div className="image-placeholder detail-placeholder">
            <span>Foto produk</span>
            <small>Belum diunggah oleh Admin</small>
          </div>
        )}
        {images.length > 1 ? (
          <>
            <button
              type="button"
              className="product-gallery-arrow product-gallery-previous"
              onClick={() => moveImage(-1)}
              aria-label="Tampilkan foto sebelumnya"
            >‹</button>
            <button
              type="button"
              className="product-gallery-arrow product-gallery-next"
              onClick={() => moveImage(1)}
              aria-label="Tampilkan foto berikutnya"
            >›</button>
            <span className="product-gallery-count" aria-live="polite">
              Foto {activeIndex + 1} dari {images.length}
            </span>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="product-thumbnails" aria-label="Pilih foto produk">
          {images.map((thumbnail, index) => (
            <button
              className={`product-thumbnail${index === activeIndex ? " is-selected" : ""}`}
              type="button"
              key={thumbnail.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`Tampilkan foto ${index + 1}`}
              aria-pressed={index === activeIndex}
            >
              <Image src={thumbnail.image_url} alt="" fill sizes="92px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
