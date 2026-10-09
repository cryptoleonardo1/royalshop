"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { addToCart, MAX_QTY, type CartLine } from "@/lib/cart-store";
import { formatEur } from "@/lib/money";
import { useAddedFlash } from "./cart-buttons";
import css from "./shop.module.css";

export function BuyBox({ item }: { item: Omit<CartLine, "quantity"> }) {
  const [qty, setQty] = useState(1);
  const [added, flash] = useAddedFlash();
  const clamp = (n: number) => Math.max(1, Math.min(MAX_QTY, Number.isFinite(n) ? Math.round(n) : 1));

  return (
    <div className={css.buyBox}>
      <div className={css.buyRow}>
        <div className={css.stepper} role="group" aria-label="Množstvo">
          <button
            type="button"
            className={css.stepBtn}
            onClick={() => setQty((q) => clamp(q - 1))}
            disabled={qty <= 1}
            aria-label="Znížiť množstvo"
          >
            <Minus size={18} aria-hidden="true" />
          </button>
          <label htmlFor="buy-qty" className={css.srOnly}>
            Počet kusov
          </label>
          <input
            id="buy-qty"
            className={css.qtyInput}
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_QTY}
            value={qty}
            onChange={(e) => setQty(clamp(Number(e.target.value)))}
          />
          <button
            type="button"
            className={css.stepBtn}
            onClick={() => setQty((q) => clamp(q + 1))}
            disabled={qty >= MAX_QTY}
            aria-label="Zvýšiť množstvo"
          >
            <Plus size={18} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          className={css.addBig}
          data-added={added || undefined}
          onClick={() => {
            addToCart(item, qty);
            flash();
          }}
        >
          {added ? <Check size={22} aria-hidden="true" /> : <ShoppingCart size={22} aria-hidden="true" />}
          {added ? "Pridané" : "Do košíka"}
        </button>
      </div>
      <p className={css.buyTotal}>
        Spolu <strong>{formatEur(item.priceGrossCents * qty)}</strong> <span>s DPH · {qty} ks</span>
      </p>
      <p className={css.srOnly} aria-live="polite">
        {added ? `${item.name}, ${qty} ks, pridané do košíka.` : ""}
      </p>
    </div>
  );
}
