"use client";

import { useSyncExternalStore } from "react";

// Guest cart in localStorage. Lines keep a display snapshot only — checkout re-reads prices
// server-side, so a stale or edited snapshot can never change what the customer pays.

export interface CartLine {
  slug: string;
  name: string;
  sku: string | null;
  priceGrossCents: number;
  image: string | null;
  quantity: number;
}

const KEY = "royal-cart-v1";
const EVENT = "royal-cart-change";
export const MAX_QTY = 99;
const EMPTY: CartLine[] = [];

let cache: { raw: string | null; lines: CartLine[] } = { raw: null, lines: EMPTY };

function read(): CartLine[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cache.lines;
  }
  if (raw === cache.raw) return cache.lines;
  let lines: CartLine[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      lines = parsed.filter(
        (l): l is CartLine => typeof l?.slug === "string" && Number.isInteger(l?.quantity) && l.quantity > 0,
      );
    }
  } catch {
    lines = EMPTY;
  }
  cache = { raw, lines };
  return lines;
}

function write(lines: CartLine[]) {
  const raw = JSON.stringify(lines);
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    // storage blocked (private mode): keep the cart for this page view only
  }
  cache = { raw, lines };
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useCartCount(): number {
  return useCart().reduce((sum, l) => sum + l.quantity, 0);
}

const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.round(n)));

export function addToCart(item: Omit<CartLine, "quantity">, quantity = 1) {
  const lines = read();
  const existing = lines.find((l) => l.slug === item.slug);
  write(
    existing
      ? lines.map((l) => (l.slug === item.slug ? { ...l, ...item, quantity: clampQty(l.quantity + quantity) } : l))
      : [...lines, { ...item, quantity: clampQty(quantity) }],
  );
}

export function setQuantity(slug: string, quantity: number) {
  write(read().map((l) => (l.slug === slug ? { ...l, quantity: clampQty(quantity) } : l)));
}

export function removeFromCart(slug: string) {
  write(read().filter((l) => l.slug !== slug));
}

export function clearCart() {
  write([]);
}
