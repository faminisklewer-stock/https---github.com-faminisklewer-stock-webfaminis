"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

const resellerInviteUrl = "https://chat.whatsapp.com/DUm7GTpGYBJFSGyAC3uO2x?s=cl&p=a&mlu=4&ilr=4";

export function ResellerBannerPopup() {
  const [isOpen, setIsOpen] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
      "button:not(:disabled), a[href]",
    );
    const first = focusable.item(0);
    const last = focusable.item(focusable.length - 1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div
      className="reseller-popup-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <section
        className="reseller-popup"
        role="dialog"
        aria-modal="true"
        aria-label="Gabung Reseller Faminis Barokah"
      >
        <button
          ref={closeButtonRef}
          className="reseller-popup-close"
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Tutup banner reseller"
        >
          <span aria-hidden="true">×</span>
        </button>
        <a
          className="reseller-popup-banner-link"
          href={resellerInviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buka grup WhatsApp reseller Faminis Barokah"
        >
          <Image
            src="/images/gabung-reseller-faminis-barokah.png"
            alt="Gabung Reseller Faminis Barokah. Gabung reseller lebih untung. Harga spesial reseller, banyak promo menarik, dan support tim kami."
            width={768}
            height={1152}
            priority
          />
        </a>
      </section>
    </div>
  );
}
