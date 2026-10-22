"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { addToCart, useCartCount, type CartLine } from "@/lib/cart-store";
import css from "./shop.module.css";

export function CartLink() {
  const count = useCartCount();
  return (
    <Link href="/kosik" className={css.cartLink}>
      <ShoppingCart size={20} aria-hidden="true" />
      <span>Košík</span>
      {count > 0 && (
        <span className={css.cartCount}>
          {count}
          <span className={css.srOnly}> {count === 1 ? "kus" : count < 5 ? "kusy" : "kusov"}</span>
        </span>
      )}
    </Link>
  );
}

// Brief "added" confirmation shared by the card button and the product buy box.
export function useAddedFlash(ms = 2400) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), ms);
    return () => window.clearTimeout(t);
  }, [added, ms]);
  return [added, () => setAdded(true)] as const;
}

export function AddToCartButton({ item }: { item: Omit<CartLine, "quantity"> }) {
  const [added, flash] = useAddedFlash();
  return (
    <>
      <button
        type="button"
        className={css.addBtn}
        data-added={added || undefined}
        onClick={() => {
          addToCart(item, 1);
          flash();
        }}
      >
        {added ? <Check size={20} aria-hidden="true" /> : <ShoppingCart size={20} aria-hidden="true" />}
        {added ? "Pridané" : "Do košíka"}
        <span className={css.srOnly}>: {item.name}</span>
      </button>
      <span className={css.srOnly} aria-live="polite">
        {added ? `${item.name} pridané do košíka.` : ""}
      </span>
    </>
  );
}

// Compact variant for the Honda engine price list table.
export function EngineAddButton({ item }: { item: Omit<CartLine, "quantity"> }) {
  const [added, flash] = useAddedFlash();
  return (
    <>
      <button
        type="button"
        className={css.engineAction}
        data-added={added || undefined}
        onClick={() => {
          addToCart(item, 1);
          flash();
        }}
      >
        {added ? <Check size={16} aria-hidden="true" /> : <ShoppingCart size={16} aria-hidden="true" />}
        {added ? "Pridané" : "Do košíka"}
        <span className={css.srOnly}>: {item.sku ?? item.name}</span>
      </button>
      <span className={css.srOnly} aria-live="polite">
        {added ? `${item.name} pridané do košíka.` : ""}
      </span>
    </>
  );
}
