import config from "../../supabase/seed-data/ag-config.json";

// AG náradie (wholesaler for e-shops): pure rules shared by the catalog import (scripts/import-ag.ts) and the
// daily stock sync (src/lib/ag-sync.ts). The feed carries one price without VAT, which matches market prices
// at or below the lowest shops, so it is taken as our purchase price: the shop sells at that price plus a flat
// markup plus VAT (founder decision 2026-11-27: 25 %, `markup_pct` in ag-config.json).

export const AG_SUPPLIER = config.supplier_slug;
export const AG_VAT_RATE = config.vat_rate;
export const AG_MARKUP_PCT = config.markup_pct;
export const AG_MIN_PRICE_CENTS = Math.round(config.min_price_gross_eur * 100);

// The feed prices have three decimals ("1.425"): go through whole thousandths so the rounding is exact.
// cents = mills / 1000 * (1 + markup) * (1 + VAT) * 100
export function agGrossCents(netEur: number): number {
  const mills = Math.round(netEur * 1000);
  return Math.round((mills * (100 + AG_MARKUP_PCT) * (100 + AG_VAT_RATE)) / 100_000);
}

export interface AgOffer {
  priceGrossCents: number;
  inStock: boolean;
  // shown in listings and search: in stock and not below the minimum price
  isListed: boolean;
}

export function agOffer(netEur: number, stock: number): AgOffer {
  const priceGrossCents = agGrossCents(netEur);
  const inStock = stock > 0 && priceGrossCents > 0;
  return { priceGrossCents, inStock, isListed: inStock && priceGrossCents >= AG_MIN_PRICE_CENTS };
}

export interface AgFeedRow {
  netEur: number;
  stock: number;
}

export interface AgPriceFeed {
  // as written by AG ("26-11-19T18:08:31+01:00"), kept for the log only
  exportedAt: string | null;
  rows: Map<string, AgFeedRow>;
}

const field = (block: string, tag: string): string => {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1].trim() : "";
};

// cennik_export.xml: <Produkt><IntKod/><Zasoba/><CenaBezDPH/>…</Produkt>. A product without a readable code,
// stock or price is left out, which the sync treats as "not available".
export function parseAgPriceFeed(xml: string): AgPriceFeed {
  const rows = new Map<string, AgFeedRow>();
  for (const m of xml.matchAll(/<Produkt>([\s\S]*?)<\/Produkt>/g)) {
    const code = field(m[1], "IntKod");
    const price = field(m[1], "CenaBezDPH");
    const stock = field(m[1], "Zasoba");
    if (!code || price === "" || stock === "" || !Number.isFinite(Number(price)) || !Number.isFinite(Number(stock))) continue;
    rows.set(code, { netEur: Number(price), stock: Number(stock) });
  }
  return { exportedAt: xml.match(/<Datum>([^<]*)<\/Datum>/)?.[1] ?? null, rows };
}
