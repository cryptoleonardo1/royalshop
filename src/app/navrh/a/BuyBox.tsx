"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import s from "./a.module.css";

export function BuyBox({ unitLabel }: { unitLabel: string }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <form
      className={s.buyRow}
      onSubmit={(e) => {
        e.preventDefault();
        setAdded(true);
      }}
    >
      <div className={s.qty}>
        <button
          type="button"
          className={s.qtyBtn}
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Znížiť množstvo"
          disabled={qty <= 1}
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <label className={s.srOnly} htmlFor="qty-a">
          Množstvo
        </label>
        <input
          id="qty-a"
          className={s.qtyInput}
          inputMode="numeric"
          value={qty}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
            setQty(Number.isFinite(n) && n > 0 ? Math.min(n, 99) : 1);
          }}
        />
        <button
          type="button"
          className={s.qtyBtn}
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          aria-label="Zvýšiť množstvo"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
      <button type="submit" className={`${s.btnPrimary} ${s.btnBig}`}>
        <ShoppingCart size={18} aria-hidden="true" />
        Do košíka
      </button>
      <p className={s.buyStatus} role="status" aria-live="polite">
        {added ? `Pridané: ${qty} × ${unitLabel}` : ""}
      </p>
    </form>
  );
}
