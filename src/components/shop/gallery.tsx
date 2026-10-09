"use client";

import { useState } from "react";
import Image from "next/image";
import { Placeholder } from "./placeholder";
import css from "./shop.module.css";

const PENDING_VIEWS = ["Celkový pohľad", "Detail", "Obsah balenia", "Typový štítok"];

type Slide = { src: string | null; label: string; alt: string | null };

export function Gallery({
  images,
  name,
  sku,
  categorySlug,
}: {
  images: { path: string; alt: string | null }[];
  name: string;
  sku: string | null;
  categorySlug: string;
}) {
  const slides: Slide[] =
    images.length > 0
      ? images.map((img, i) => ({ src: img.path, label: `Foto ${i + 1}`, alt: img.alt }))
      : PENDING_VIEWS.map((label) => ({ src: null, label, alt: null }));
  const [active, setActive] = useState(0);
  const index = Math.min(active, slides.length - 1);
  const current = slides[index];

  return (
    <div className={css.gallery}>
      <div className={css.galleryMain}>
        {current.src ? (
          <Image
            src={current.src}
            alt={current.alt ?? `${name} – ${current.label}`}
            fill
            sizes="(max-width: 1023px) 100vw, 56vw"
            className={css.productImg}
            preload
          />
        ) : (
          <Placeholder sku={sku} name={name} categorySlug={categorySlug} view={current.label} large />
        )}
        <span className={css.galleryCount} aria-hidden="true">
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {slides.length > 1 && (
        <ul className={css.thumbs} aria-label="Náhľady">
          {slides.map((slide, i) => (
            <li key={`${slide.label}-${i}`}>
              <button
                type="button"
                className={css.thumb}
                aria-pressed={i === index}
                aria-label={`Zobraziť: ${slide.label}`}
                onClick={() => setActive(i)}
              >
                {slide.src ? (
                  <Image src={slide.src} alt="" fill sizes="120px" className={css.productImg} />
                ) : (
                  <span className={css.thumbLabel}>
                    <span className={css.thumbNum}>{String(i + 1).padStart(2, "0")}</span>
                    {slide.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
