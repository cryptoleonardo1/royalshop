import type { SupabaseClient } from "@supabase/supabase-js";
import { AG_SUPPLIER, agOffer, parseAgPriceFeed } from "./ag-feed";

// Daily stock and price sync for the AG náradie range. Only products already imported by scripts/import-ag.ts
// are touched; new products, photos and texts come from that import. A product that is sold out, missing from
// the feed or below the minimum price is taken out of the listings (is_listed = false, in_stock = false); its
// page stays and says it is not available. No Next or "server-only" imports here: the cron route and
// scripts/ag-sync.ts both call this.

// A healthy feed has about 18 000 products. Anything far below that is a broken export: change nothing.
const MIN_FEED_ROWS = 5000;
// Abort when this share of our AG products is missing from the feed (AG rebuilding its system, wrong file).
const MAX_MISSING_SHARE = 0.3;
const PAGE = 1000;
const BATCH = 200;

export interface AgSyncResult {
  exportedAt: string | null;
  feedRows: number;
  products: number;
  listed: number;
  stockChanged: number;
  priceChanged: number;
  missingFromFeed: number;
}

interface Row {
  id: string;
  sku: string | null;
  price_gross_cents: number;
  in_stock: boolean | null;
  is_listed: boolean;
}

export async function fetchAgPriceFeed(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(45_000) });
  if (!res.ok) throw new Error(`AG feed: HTTP ${res.status}`);
  return res.text();
}

export async function syncAgStock(db: SupabaseClient, xml: string): Promise<AgSyncResult> {
  const feed = parseAgPriceFeed(xml);
  if (feed.rows.size < MIN_FEED_ROWS) throw new Error(`AG feed: only ${feed.rows.size} products, nothing changed`);

  const supplier = await db.from("suppliers").select("id").eq("slug", AG_SUPPLIER).maybeSingle();
  if (supplier.error) throw new Error(`AG sync: supplier: ${supplier.error.message}`);
  if (!supplier.data) throw new Error("AG sync: supplier not found (run scripts/import-ag.ts first)");

  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from("products")
      .select("id, sku, price_gross_cents, in_stock, is_listed")
      .eq("supplier_id", supplier.data.id)
      .eq("status", "active")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`AG sync: products: ${error.message}`);
    rows.push(...((data ?? []) as Row[]));
    if ((data ?? []).length < PAGE) break;
  }

  const missing = rows.filter((r) => !r.sku || !feed.rows.has(r.sku));
  if (rows.length && missing.length / rows.length > MAX_MISSING_SHARE)
    throw new Error(`AG feed: ${missing.length} of ${rows.length} products missing, nothing changed`);

  // Stock flags change for many rows at once, so they go in grouped updates; prices change rarely, one by one.
  const flags = new Map<string, string[]>();
  const prices: { id: string; cents: number }[] = [];
  let listed = 0;
  for (const r of rows) {
    const entry = r.sku ? feed.rows.get(r.sku) : undefined;
    const offer = entry ? agOffer(entry.netEur, entry.stock) : null;
    const inStock = offer?.inStock ?? false;
    const isListed = offer?.isListed ?? false;
    if (isListed) listed++;
    if (r.in_stock !== inStock || r.is_listed !== isListed) {
      const key = `${inStock}:${isListed}`;
      flags.set(key, [...(flags.get(key) ?? []), r.id]);
    }
    // a price of 0 means AG has no price right now: keep the last one, the product is unlisted anyway
    if (offer && offer.priceGrossCents > 0 && offer.priceGrossCents !== r.price_gross_cents)
      prices.push({ id: r.id, cents: offer.priceGrossCents });
  }

  let stockChanged = 0;
  for (const [key, ids] of flags) {
    const [inStock, isListed] = key.split(":").map((v) => v === "true");
    for (let i = 0; i < ids.length; i += BATCH) {
      const part = ids.slice(i, i + BATCH);
      const { error } = await db.from("products").update({ in_stock: inStock, is_listed: isListed }).in("id", part);
      if (error) throw new Error(`AG sync: stock update: ${error.message}`);
      stockChanged += part.length;
    }
  }
  for (const p of prices) {
    const { error } = await db.from("products").update({ price_gross_cents: p.cents }).eq("id", p.id);
    if (error) throw new Error(`AG sync: price update: ${error.message}`);
  }

  return {
    exportedAt: feed.exportedAt,
    feedRows: feed.rows.size,
    products: rows.length,
    listed,
    stockChanged,
    priceChanged: prices.length,
    missingFromFeed: missing.length,
  };
}
