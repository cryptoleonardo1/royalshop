"use client";

import { useState } from "react";
import Image from "next/image";
import css from "./stavenisko.module.css";
import { Placeholder } from "./placeholder";

const PENDING_VIEWS = ["Celkový pohľad", "Detail upínania", "Obsah kufra", "Typový štítok"];

type Slide = { src: string | null; label: string };

export function Gallery({
  images,
  name,
  sku,
  category,
}: {
  images: string[];
  name: string;
  sku: string;
  category: string;
}) {
  const slides: Slide[] =
    images.length > 0
      ? images.map((src, i) => ({ src, label: `Foto ${i + 1}` }))
      : PENDING_VIEWS.map((label) => ({ src: null, label }));
  const [active, setActive] = useState(0);
  const index = Math.min(active, slides.length - 1);
  const current = slides[index];

  return (
    <div className={css.gallery}>
      <div className={css.galleryMain}>
        {current.src ? (
          <Image
            src={current.src}
            alt={`${name} – ${current.label}`}
            fill
            sizes="(max-width: 1023px) 100vw, 56vw"
            className={css.productImg}
            unoptimized={current.src.toLowerCase().endsWith(".svg")}
            loading="eager"
          />
        ) : (
          <Placeholder sku={sku} name={name} category={category} view={current.label} large />
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
                  <Image
                    src={slide.src}
                    alt=""
                    fill
                    sizes="120px"
                    className={css.productImg}
                    unoptimized={slide.src.toLowerCase().endsWith(".svg")}
                  />
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
