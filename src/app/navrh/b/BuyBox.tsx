"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import s from "./b.module.css";

const MAX = 20;

export function BuyBox({ productName }: { productName: string }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const set = (n: number) => {
    setQty(Math.min(MAX, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1)));
    setAdded(false);
  };

  return (
    <div className={s.buyBox}>
      <div className={s.qty}>
        <button type="button" className={s.qtyBtn} onClick={() => set(qty - 1)} disabled={qty <= 1} aria-label="Znížiť množstvo">
          <Minus size={16} aria-hidden="true" />
        </button>
        <label className={s.srOnly} htmlFor="b-qty">
          Množstvo
        </label>
        <input
          id="b-qty"
          className={s.qtyInput}
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX}
          value={qty}
          onChange={(e) => set(e.currentTarget.valueAsNumber)}
        />
        <button type="button" className={s.qtyBtn} onClick={() => set(qty + 1)} disabled={qty >= MAX} aria-label="Zvýšiť množstvo">
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
      <button type="button" className={`${s.btnPrimary} ${s.buyBtn}`} onClick={() => setAdded(true)}>
        {added ? <Check size={18} aria-hidden="true" /> : <ShoppingBag size={18} aria-hidden="true" />}
        {added ? "V košíku" : "Do košíka"}
      </button>
      <p className={s.buyStatus} role="status">
        {added ? `${qty} × ${productName} sme pridali do košíka.` : ""}
      </p>
    </div>
  );
}
