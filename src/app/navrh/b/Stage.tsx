import Image from "next/image";
import s from "./b.module.css";

export interface StageProps {
  src: string | null;
  alt: string;
  sku: string;
  brand: string;
  sizes: string;
  variant?: "card" | "hero" | "detail" | "thumb";
  preload?: boolean;
  /** Optional crop/zoom for alternate gallery views, e.g. "scale(1.6) translate(10%, 8%)". */
  zoom?: string;
}

/**
 * A lit display niche: a warm pool of light on graphite. Real photos are multiplied onto
 * the pool so white studio backgrounds dissolve into the light. Without a photo, the niche
 * shows an engraved model plate instead of a broken image.
 */
export function Stage({ src, alt, sku, brand, sizes, variant = "card", preload, zoom }: StageProps) {
  return (
    <div className={`${s.stage} ${s[`stage_${variant}`]}`}>
      <span className={s.stagePool} aria-hidden="true" />
      {src ? (
        <div className={s.stageImgWrap} style={zoom ? { transform: zoom } : undefined}>
          <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className={s.stageImg} />
        </div>
      ) : (
        <div
          className={s.plate}
          {...(alt ? { role: "img", "aria-label": `${alt} — fotografia sa pripravuje` } : { "aria-hidden": true })}
        >
          <span className={s.plateBrand} aria-hidden="true">
            {brand}
          </span>
          <span className={s.plateSku} aria-hidden="true" style={zoom ? { transform: zoom } : undefined}>
            {sku}
          </span>
          {variant !== "thumb" && (
            <span className={s.plateNote} aria-hidden="true">
              Foto v príprave
            </span>
          )}
        </div>
      )}
      <span className={s.stagePlinth} aria-hidden="true" />
    </div>
  );
}
