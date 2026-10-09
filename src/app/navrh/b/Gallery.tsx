"use client";

import { useState } from "react";
import { Stage } from "./Stage";
import s from "./b.module.css";

const VIEWS = [
  { label: "Celkový pohľad", zoom: undefined },
  { label: "Detail upínania", zoom: "scale(1.75) translate(-14%, 4%)" },
  { label: "Rukoväť a spínač", zoom: "scale(1.6) translate(16%, -2%)" },
  { label: "Bočný pohľad", zoom: "scale(1.25) translate(0, -5%)" },
];

export function Gallery({ src, alt, sku, brand }: { src: string | null; alt: string; sku: string; brand: string }) {
  const [active, setActive] = useState(0);
  const view = VIEWS[active];

  return (
    <div className={s.gallery}>
      <div className={s.galleryMain}>
        <Stage
          src={src}
          alt={`${alt} — ${view.label.toLowerCase()}`}
          sku={sku}
          brand={brand}
          sizes="(min-width: 1000px) 640px, 100vw"
          variant="detail"
          zoom={view.zoom}
        />
        <p className={s.galleryCaption} aria-live="polite">
          <span>{String(active + 1).padStart(2, "0")}</span> / {String(VIEWS.length).padStart(2, "0")} · {view.label}
        </p>
      </div>
      <ul className={s.thumbs} aria-label="Pohľady na produkt">
        {VIEWS.map((v, i) => (
          <li key={v.label}>
            <button
              type="button"
              className={s.thumb}
              aria-pressed={i === active}
              aria-label={v.label}
              onClick={() => setActive(i)}
            >
              <Stage src={src} alt="" sku={sku} brand={brand} sizes="120px" variant="thumb" zoom={v.zoom} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
