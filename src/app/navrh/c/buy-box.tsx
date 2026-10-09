"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { eur } from "../_data";
import css from "./stavenisko.module.css";

const MAX_QTY = 99;

export function BuyBox({ unitPrice, name }: { unitPrice: number; name: string }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2400);
    return () => window.clearTimeout(t);
  }, [added]);

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
          <label htmlFor="c-qty" className={css.srOnly}>
            Počet kusov
          </label>
          <input
            id="c-qty"
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
        <button type="button" className={css.addBig} onClick={() => setAdded(true)} data-added={added || undefined}>
          {added ? <Check size={22} aria-hidden="true" /> : <ShoppingCart size={22} aria-hidden="true" />}
          {added ? "Pridané" : "Do košíka"}
        </button>
      </div>
      <p className={css.buyTotal}>
        Spolu <strong>{eur(unitPrice * qty)}</strong> <span>s DPH · {qty} ks</span>
      </p>
      <p className={css.srOnly} aria-live="polite">
        {added ? `${name}, ${qty} ks, pridané do košíka.` : ""}
      </p>
    </div>
  );
}
