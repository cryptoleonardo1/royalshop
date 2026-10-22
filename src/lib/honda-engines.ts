import pricelist from "../data/honda-engines.json";
import type { VatRate } from "./money";

// Full Honda GX engine price list (src/data/honda-engines.json, built by scripts/honda-engines.py).
// Every variant is a sellable product: the five we stock are regular catalog products (matched by SKU),
// the rest are seeded as unlisted products (is_listed = false) so they can go through cart and checkout.

export interface HondaEngine {
  code: string;
  model: string;
  type: string;
  version: string | null;
  colour: string;
  priceGrossCents: number;
}

export const hondaEngines = pricelist.engines as HondaEngine[];
export const hondaVatRate = pricelist.vatRate as VatRate;
export const hondaPriceList = { validFrom: pricelist.validFrom, validTo: pricelist.validTo };

// Product slug / name of an unlisted engine variant. The seed and the price list table must agree.
export const hondaEngineSlug = (code: string) => `honda-motor-${code.toLowerCase()}`;
export const hondaEngineName = (code: string) => `Motor Honda ${code}`;

// How to read a Honda GX designation such as GX160UT2X-QX-4-OH (model – type – version – colour).
// Only the first letter of the type (the PTO shaft) is documented by Honda (shop manual GX120/160/200 UT2,
// Honda Engines Europe technical sheets); everything else is worded as "usually", because Honda publishes
// no key for it. Research and sources: docs/05-sortiment-stroje.md.

type Family = "GX25" | "GX120" | "GX160" | "GX200" | "GX240" | "GX270" | "GX390" | string;

export const family = (model: string): Family => model.match(/^GX\d+/)?.[0] ?? model;
const small = (f: Family) => f === "GX120" || f === "GX160" || f === "GX200";

function shaft(letter: string, f: Family): string | null {
  switch (letter) {
    case "Q":
      if (small(f)) return "hriadeľ s perom Ø 3/4″ (19,05 mm)";
      if (f === "GX390") return "hriadeľ s perom Ø 1″ (25,4 mm)";
      return "hriadeľ s perom, palcový";
    case "S":
      if (f === "GX120") return "hriadeľ s perom Ø 18 mm";
      if (f === "GX160" || f === "GX200") return "hriadeľ s perom Ø 20 mm";
      return "hriadeľ s perom, metrický";
    case "T":
      return "hriadeľ s vonkajším závitom 5/8″";
    case "P":
      return "hriadeľ s vonkajším závitom 3/4″";
    case "V":
      return "kužeľový hriadeľ (elektrocentrály)";
    case "W":
      return "hriadeľ s metrickým závitom (čerpadlá)";
    case "U":
      return "stupňovitý hriadeľ so závitom 1/2″";
    case "H":
      return "prevodovka 1 : 6, výstup s perom";
    case "L":
      return "reťazová redukcia 1 : 2";
    case "R":
      return "reťazová redukcia 1 : 2 so spojkou";
    default:
      return null;
  }
}

const COLOUR: Record<string, string> = { OH: "červený", SD: "čierny" };

// One short line under each engine code in the price list (also the variant product description).
export function shaftLabel(e: { model: string; type: string; colour: string }): string {
  const f = family(e.model);
  const parts = [f === "GX25" ? "prevedenie podľa typového štítku" : (shaft(e.type[0], f) ?? "prevedenie podľa typového štítku")];
  if (COLOUR[e.colour]) parts.push(COLOUR[e.colour]);
  return parts.join(" · ");
}
