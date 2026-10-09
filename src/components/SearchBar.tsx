"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

type Suggestion = { name: string; slug: string; category: string | null };

export function SearchBar({ initialValue = "" }: { initialValue?: string }) {
  const id = useId();
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState("");

  useEffect(() => {
    const term = value.trim();
    if (term.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        const result = await response.json() as { suggestions?: Suggestion[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Pencarian belum dapat dimuat.");
        const nextSuggestions = result.suggestions ?? [];
        setSuggestions(nextSuggestions);
        setOpen(nextSuggestions.length > 0);
        setActiveIndex(-1);
        setError("");
        setSearchedTerm(term);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        console.error("Search suggestions could not be loaded.", caught);
        setSuggestions([]);
        setError("Saran pencarian belum tersedia.");
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      router.push(`/produk/${suggestions[activeIndex].slug}`);
    }
  }

  return (
    <div className="search-wrap">
      <form className="search-form" action="/cari" role="search">
        <Icon name="search" className="search-icon" />
        <label className="sr-only" htmlFor={`site-search-${id}`}>Cari produk</label>
        <input
          id={`site-search-${id}`}
          type="search"
          name="q"
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            if (nextValue.trim().length < 2) {
              setSuggestions([]);
              setOpen(false);
              setActiveIndex(-1);
              setError("");
              setLoading(false);
              setSearchedTerm("");
            }
          }}
          onFocus={() => { if (suggestions.length) setOpen(true); }}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder="Cari produk, kategori, atau motif..."
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-busy={loading}
          aria-controls={`search-options-${id}`}
          aria-activedescendant={activeIndex >= 0 ? `search-option-${id}-${activeIndex}` : undefined}
        />
        <button type="submit" aria-label="Mulai pencarian"><Icon name="search" /></button>
      </form>
      {open && suggestions.length ? (
        <ul className="search-suggestions" id={`search-options-${id}`} role="listbox" aria-label="Saran produk">
          {suggestions.map((item, index) => (
            <li role="presentation" key={item.slug}>
              <button
                id={`search-option-${id}-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => router.push(`/produk/${item.slug}`)}
              >
                <strong>{item.name}</strong>
                {item.category ? <small>{item.category}</small> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {loading ? <span className="search-error" role="status">Mencari produk...</span> : null}
      {!loading && searchedTerm.length >= 2 && searchedTerm === value.trim() && !suggestions.length && !error ? (
        <span className="search-error" role="status">Tidak ada saran. Tekan Enter untuk melihat hasil pencarian.</span>
      ) : null}
      {error ? <span className="search-error" role="status">{error}</span> : null}
    </div>
  );
}
