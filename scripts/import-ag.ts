// AG náradie range: supabase/seed-data/ag.json -> database, photos -> Storage bucket "product-images".
// The JSON and the photos come from scripts/ag-catalog.py (the wholesaler's two XML feeds).
//
//   npx tsx scripts/import-ag.ts                                              (local, reads .env.local)
//   set -a; . ./.env.hosted.local; set +a; npx tsx scripts/import-ag.ts       (hosted)
//
// Safe to re-run: products are matched by AG's stock code (products.sku), their specs and photos are replaced,
// prices and stock are updated, and products that left ag.json are archived. Everything at or above the minimum
// price is imported; the shop lists only what is in stock (is_listed, see src/lib/ag-feed.ts), and the daily
// sync (src/lib/ag-sync.ts) keeps stock and prices current between imports.
// Selling price = feed price + VAT until AG confirms what the feed price is; no product_costs rows are written.

import { config } from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { AG_SUPPLIER, AG_VAT_RATE, agOffer } from "../src/lib/ag-feed";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

const db = createClient(url, key, { auth: { persistSession: false } });

const BUCKET = "product-images";
const FOLDER = "ag";
const PHOTO_DIR = "originals/ag/img";
const CHUNK = 100;

const SUPPLIER = {
  slug: AG_SUPPLIER,
  name: "AG náradie",
  country: "SK",
  // not confirmed by AG yet
  lead_time_days_min: 2,
  lead_time_days_max: 4,
  is_eu_import: false,
  note: "Veľkoobchod pre e-shopy, XML feedy (cenník + karty). Predajná cena = cena z feedu + DPH, kým AG nepotvrdí, čo cena vo feede znamená.",
};

const SAFETY_INFO =
  "Pred použitím si prečítajte návod na použitie a bezpečnostné pokyny výrobcu. Používajte ochranné pomôcky podľa druhu práce.";

interface AgProduct {
  code: string;
  ean: string | null;
  name: string;
  brand_slug: string;
  category_slug: string;
  price_net_eur: number;
  stock: number;
  weight_kg: number | null;
  short_description: string;
  description: string | null;
  specs: { key: string; label: string; value: string; unit: string | null; is_filterable: boolean }[];
  images: string[];
}

interface AgJson {
  exported_at: string | null;
  brands: { slug: string; name: string }[];
  categories: { slug: string; name: string; parent_slug: string | null; sort_order: number }[];
  products: AgProduct[];
}

function must<T>(res: { data: T; error: { message: string } | null }, what: string): NonNullable<T> {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data as NonNullable<T>;
}

const chunks = <T>(list: T[], size = CHUNK): T[][] =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));

const fold = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function idsBySlug(table: string): Promise<Record<string, string>> {
  const rows = must(await db.from(table).select("id, slug").limit(5000), table);
  return Object.fromEntries(rows.map((r) => [r.slug, r.id]));
}

// Existing categories (the machine catalogue, catalog.json) are left alone; only the new ones are added.
async function syncCategories(categories: AgJson["categories"]): Promise<Record<string, string>> {
  const ids = await idsBySlug("categories");
  const pending = [...categories];
  while (pending.length) {
    const ready = pending.filter((c) => !c.parent_slug || ids[c.parent_slug]);
    if (!ready.length) throw new Error("Category parents unresolved: " + pending.map((c) => c.slug).join(", "));
    const rows = must(
      await db
        .from("categories")
        .upsert(
          ready.map((c) => ({
            slug: c.slug,
            name: c.name,
            parent_id: c.parent_slug ? ids[c.parent_slug] : null,
            sort_order: c.sort_order,
          })),
          { onConflict: "slug" },
        )
        .select("id, slug"),
      "categories",
    );
    rows.forEach((r) => (ids[r.slug] = r.id));
    ready.forEach((c) => pending.splice(pending.indexOf(c), 1));
  }
  return ids;
}

async function uploadPhotos(paths: string[]) {
  const existing = new Set<string>();
  for (let offset = 0; ; offset += 1000) {
    const page = must(await db.storage.from(BUCKET).list(FOLDER, { limit: 1000, offset }), "list photos");
    page.forEach((o) => existing.add(`${FOLDER}/${o.name}`));
    if (page.length < 1000) break;
  }
  const todo = paths.filter((p) => !existing.has(p));
  let done = 0;
  for (const batch of chunks(todo, 8)) {
    await Promise.all(
      batch.map(async (path) => {
        const file = `${PHOTO_DIR}/${path.slice(FOLDER.length + 1)}`;
        if (!existsSync(file)) throw new Error(`Photo missing on disk: ${file} (run scripts/ag-catalog.py)`);
        must(
          await db.storage.from(BUCKET).upload(path, readFileSync(file), { contentType: "image/webp", cacheControl: "31536000" }),
          `upload ${path}`,
        );
      }),
    );
    done += batch.length;
    if (done % 400 < 8) console.log(`  photos ${done}/${todo.length}`);
  }
  console.log(`Photos: ${todo.length} uploaded, ${paths.length - todo.length} already in the bucket`);
}

async function main() {
  if (!existsSync("supabase/seed-data/ag.json")) throw new Error("supabase/seed-data/ag.json is missing: run scripts/ag-catalog.py");
  const feed: AgJson = JSON.parse(readFileSync("supabase/seed-data/ag.json", "utf8"));
  const products = feed.products;
  console.log(`Importing ${products.length} AG products (feed of ${feed.exported_at}) into ${url}`);

  const supplierId = must(await db.from("suppliers").upsert(SUPPLIER, { onConflict: "slug" }).select("id").single(), "supplier").id;
  // Brands that exist keep their name and manufacturer details (GPSR); the feed gives only a name.
  must(await db.from("brands").upsert(feed.brands, { onConflict: "slug", ignoreDuplicates: true }).select("id"), "brands");
  const brandId = await idsBySlug("brands");
  const categoryId = await syncCategories(feed.categories);

  await uploadPhotos(products.flatMap((p) => p.images));

  // A product keeps its slug (its address) when AG renames it: match by stock code first.
  const known = new Map<string, string>();
  const active: { id: string; sku: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const page = must(
      await db.from("products").select("id, slug, sku, status").eq("supplier_id", supplierId).order("id").range(from, from + 999),
      "existing products",
    );
    page.forEach((r) => {
      known.set(r.sku, r.slug);
      if (r.status === "active") active.push({ id: r.id, sku: r.sku });
    });
    if (page.length < 1000) break;
  }

  let listed = 0;
  let done = 0;
  for (const batch of chunks(products)) {
    const rows = must(
      await db
        .from("products")
        .upsert(
          batch.map((p) => {
            if (!categoryId[p.category_slug]) throw new Error(`${p.code}: unknown category ${p.category_slug}`);
            if (!brandId[p.brand_slug]) throw new Error(`${p.code}: unknown brand ${p.brand_slug}`);
            const offer = agOffer(p.price_net_eur, p.stock);
            if (offer.isListed) listed++;
            return {
              slug: known.get(p.code) ?? `${fold(p.name).slice(0, 70).replace(/-+$/, "")}-${p.code}`,
              name: p.name,
              brand_id: brandId[p.brand_slug],
              supplier_id: supplierId,
              category_id: categoryId[p.category_slug],
              sku: p.code,
              ean: p.ean,
              short_description: p.short_description,
              description: p.description,
              price_gross_cents: offer.priceGrossCents,
              vat_rate: AG_VAT_RATE,
              weight_kg: p.weight_kg,
              shipping_class: "courier",
              warranty_months: 24,
              safety_info: SAFETY_INFO,
              status: "active",
              in_stock: offer.inStock,
              is_listed: offer.isListed,
            };
          }),
          { onConflict: "slug" },
        )
        .select("id, sku"),
      "products",
    );
    const ids = Object.fromEntries(rows.map((r) => [r.sku, r.id]));
    const batchIds = rows.map((r) => r.id);
    for (const table of ["product_specs", "product_images"])
      must(await db.from(table).delete().in("product_id", batchIds).select("product_id"), `clear ${table}`);
    const specs = batch.flatMap((p) => p.specs.map((s, i) => ({ ...s, product_id: ids[p.code], sort_order: i })));
    const images = batch.flatMap((p) => p.images.map((path, i) => ({ product_id: ids[p.code], path, alt: p.name, sort_order: i })));
    for (const part of chunks(specs, 500)) must(await db.from("product_specs").insert(part).select("id"), "specs");
    for (const part of chunks(images, 500)) must(await db.from("product_images").insert(part).select("id"), "images");
    done += batch.length;
    if (done % 500 < CHUNK) console.log(`  products ${done}/${products.length}`);
  }

  // Products that left the selection (below the minimum price, no photo any more, gone from the feed)
  // stay in old orders but disappear from the shop.
  const current = new Set(products.map((p) => p.code));
  const gone = active.filter((r) => !current.has(r.sku)).map((r) => r.id);
  for (const batch of chunks(gone))
    must(await db.from("products").update({ status: "archived" }).in("id", batch).select("id"), "archive");

  console.log(`Done: ${products.length} products, ${listed} listed (in stock), ${products.length - listed} hidden, ${gone.length} archived.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
