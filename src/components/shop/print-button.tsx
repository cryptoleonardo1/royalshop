"use client";

import { Printer } from "lucide-react";
import css from "./shop.module.css";

// Browser print dialog: also "Uložiť ako PDF", the customer's own durable copy.
export function PrintButton({ label = "Vytlačiť alebo uložiť ako PDF" }: { label?: string }) {
  return (
    <button type="button" className={css.btnGhost} onClick={() => window.print()}>
      <Printer size={18} aria-hidden="true" /> {label}
    </button>
  );
}
