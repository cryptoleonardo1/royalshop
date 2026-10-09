"use client";

import Image from "next/image";
import { useState } from "react";
import s from "./a.module.css";
import { DimH, DimV, ToolDrawing, type ToolKind } from "./Drawing";

type View = { label: string; src?: string; viewBox?: string; dims?: boolean };

export function Gallery({
  images,
  kind,
  sku,
  name,
}: {
  images: string[];
  kind: ToolKind;
  sku: string;
  name: string;
}) {
  const views: View[] = [
    ...images.map((src, i) => ({ label: `Foto ${i + 1}`, src })),
    { label: "Nákres (ilustr.)", dims: false },
    { label: "Rozmery (ilustr.)", dims: true },
    { label: "Detail upínania", viewBox: "0 36 110 70" },
  ];
  const [active, setActive] = useState(0);
  const v = views[active] ?? views[0];

  return (
    <div className={s.gallery}>
      <figure className={s.galleryStage}>
        {v.src ? (
          <Image
            src={v.src}
            alt={`${name} – ${v.label}`}
            fill
            sizes="(max-width: 900px) 100vw, 55vw"
            className={s.photo}
            priority={active === 0}
          />
        ) : (
          <ToolDrawing kind={kind} viewBox={v.viewBox ?? (v.dims ? "-14 -6 268 176" : undefined)}>
            {v.dims && (
              <>
                <DimH x1={4} x2={216} y={160} from={142} label="L ≈ 590 mm" />
                <DimV y1={44} y2={130} x={238} from={220} label="H ≈ 245 mm" />
              </>
            )}
          </ToolDrawing>
        )}
        <figcaption className={s.galleryCaption}>
          <span>Obr. {String(active + 1).padStart(2, "0")}</span>
          <span>{v.label}</span>
          <span>{sku}</span>
        </figcaption>
        <span className={s.sheetMark} aria-hidden="true">
          {sku}
        </span>
      </figure>
      <div className={s.thumbs} role="group" aria-label="Pohľady na produkt">
        {views.map((t, i) => (
          <button
            key={t.label}
            type="button"
            className={s.thumb}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
          >
            <span className={s.thumbArt} aria-hidden="true">
              {t.src ? (
                <Image src={t.src} alt="" fill sizes="96px" className={s.photo} />
              ) : (
                <ToolDrawing kind={kind} viewBox={t.viewBox} />
              )}
            </span>
            <span className={s.thumbLabel}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
