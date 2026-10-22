"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { quoteCart } from "@/lib/checkout-actions";
import type { Quote } from "@/lib/cart-pricing";
import type { ShippingMethod } from "@/lib/order-state";
import { removeFromCart, useCart, type CartLine } from "@/lib/cart-store";

const noopSubscribe = () => () => {};

// True after hydration — the cart lives in localStorage, so the server render is always "empty".
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

// Server-priced view of the browser cart. Products that are no longer sold drop out of the cart.
export function useQuote(method?: ShippingMethod | null) {
  const lines = useCart();
  const [result, setResult] = useState<{ key: string; quote: Quote | null } | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const key = JSON.stringify([lines.map((l) => [l.slug, l.quantity]), method ?? null]);

  useEffect(() => {
    const current: Pick<CartLine, "slug" | "quantity">[] = lines.map((l) => ({ slug: l.slug, quantity: l.quantity }));
    if (current.length === 0) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      quoteCart(current, method ?? null).then((q) => {
        if (cancelled) return;
        setResult({ key, quote: q });
        if (q?.missing.length) {
          const names = lines.filter((l) => q.missing.includes(l.slug)).map((l) => l.name);
          setRemoved((prev) => [...new Set([...prev, ...names])]);
          q.missing.forEach(removeFromCart);
        }
      });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
    // `key` captures lines and method by value; the arrays themselves change identity often
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    lines,
    // keep showing the last quote while a newer one loads, so the summary does not flash
    quote: lines.length ? (result?.quote ?? null) : null,
    loading: lines.length > 0 && result?.key !== key,
    removed,
  };
}
