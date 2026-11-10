"use client";

import Link from "next/link";
import css from "./print.module.css";

// Screen-only bar above a printed document.
export function PrintToolbar({ orderNumber }: { orderNumber: string }) {
  return (
    <div className={css.toolbar}>
      <Link href={`/admin/objednavky/${encodeURIComponent(orderNumber)}`}>← Objednávka {orderNumber}</Link>
      <span>Tlačte 2× (zákazník + predajňa).</span>
      <button type="button" className={css.printBtn} onClick={() => window.print()}>
        Tlačiť
      </button>
    </div>
  );
}
