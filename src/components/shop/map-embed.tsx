"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import css from "./shop.module.css";

// Google Maps loads only after a click: the embed sets Google cookies and sends the visitor's IP to Google,
// so it waits for the visitor's choice instead of loading with the page.
export function MapEmbed({ src, title }: { src: string; title: string }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return <iframe className={css.mapFrame} src={src} title={title} loading="lazy" allowFullScreen />;
  }
  return (
    <div className={css.mapFacade}>
      <MapPin size={36} aria-hidden="true" />
      <button type="button" className={css.mapLoad} onClick={() => setOpen(true)}>
        Zobraziť mapu
      </button>
      <p>Mapa sa načíta zo služby Google Maps.</p>
    </div>
  );
}
