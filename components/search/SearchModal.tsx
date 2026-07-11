"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Search, SearchX, Tag, X } from "lucide-react";

import { useSearch } from "@/components/search/search-context";
import type { SearchResponse } from "@/app/api/search/route";

const EMPTY: SearchResponse = { query: "", products: [], collections: [] };

export function SearchModal() {
  const { open, closeSearch } = useSearch();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[10vh] sm:pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        >
          <button
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
            className="absolute inset-0 -z-10 cursor-default bg-foreground/40 backdrop-blur-sm"
          />
          <SearchPanel onClose={closeSearch} reduceMotion={Boolean(shouldReduceMotion)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Mounted only while the modal is open, so local state resets each time. */
function SearchPanel({ onClose, reduceMotion }: { onClose: () => void; reduceMotion: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>(EMPTY);
  const [loading, setLoading] = useState(false);

  // Autofocus + Escape to close.
  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Debounced live search — setState only runs inside the async callback.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 1) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (res.ok) setResults((await res.json()) as SearchResponse);
      } catch {
        /* aborted or network error — keep prior results */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  function onChange(value: string) {
    setQuery(value);
    if (value.trim().length < 1) {
      setResults(EMPTY);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  const term = query.trim();
  const hasResults = results.products.length > 0 || results.collections.length > 0;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search products and collections…"
          className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
        {loading && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
        {term.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            Start typing to search the collection.
          </p>
        ) : !hasResults && !loading ? (
          <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
            <SearchX className="size-7 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">No results for &ldquo;{term}&rdquo;</p>
            <p className="text-xs text-muted-foreground">Try a different name, note or category.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.collections.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Collections
                </p>
                {results.collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Tag className="size-4 text-accent" aria-hidden="true" />
                    {collection.name}
                  </Link>
                ))}
              </div>
            )}

            {results.products.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Products
                </p>
                {results.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                      {product.image && (
                        <Image src={product.image} alt={product.name} fill sizes="44px" className="object-cover" />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">{product.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{product.category}</span>
                    </span>
                    {product.price && (
                      <span className="shrink-0 text-sm font-medium text-foreground">{product.price}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        <span>Press Esc to close</span>
        <Link href="/shop" onClick={onClose} className="font-medium text-accent hover:underline">
          Browse all products
        </Link>
      </div>
    </motion.div>
  );
}
