// Nivel System measuring instruments: supabase/seed-data/nivel.json -> database, photos -> Storage bucket
// "product-images". The JSON and the photos come from scripts/nivel-catalog.py (3gonshop.sk, the shop of the
// Slovak importer 3gon Slovakia; we are an authorised dealer and sell at its prices).
//
//   npx tsx scripts/import-nivel.ts                                              (local, reads .env.local)
//   set -a; . ./.env.hosted.local; set +a; npx tsx scripts/import-nivel.ts       (hosted)
//
// Safe to re-run: products are matched by slug (3gonshop's address), their specs, photos and documents (manuals
// linked on nivelsystem.com) are replaced, prices and stock are updated, and 3gon products that left nivel.json are
// archived. Tripods and staffs carry "accessory_for" (the instruments the manufacturer recommends them for): those
// pairs replace the tripod's or staff's related_products rows of type 'accessory', shown on the instrument page. Run it again after scripts/seed.ts,
// which wipes the catalog.
// Purchase prices go to product_costs only when the git-ignored docs/cenniky/data/nivel-naklady.json is on disk
// ({"discount_pct": n}: our discount off 3gonshop's price without VAT); the repo is public.

import { config } from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { eurToCents } from "../src/lib/money";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

const db = createClient(url, key, { auth: { persistSession: false } });

const SOURCE = "supabase/seed-data/nivel.json";
const COSTS = "docs/cenniky/data/nivel-naklady.json";
const BUCKET = "product-images";
const FOLDER = "nivel";
const PHOTO_DIR = "originals/nivel/img";
const VAT_RATE = 23;

const SUPPLIER = {
  slug: "3gon",
  name: "3gon Slovakia, s.r.o.",
  country: "SK",
  lead_time_days_min: 1,
  lead_time_days_max: 2,
  is_eu_import: false,
  note: "Slovenský dovozca Nivel System (IČO 52367339, Klincová 35, 821 08 Bratislava; prevádzka Priemyselná 2, 924 01 Galanta). Sme autorizovaný predajca, predávame za ceny 3gonshop.sk, dodanie do 2 dní.",
};

interface NivelProduct {
  slug: string;
  source_url: string;
  sku: string;
  name: string;
  category_slug: string;
  price_gross_eur: number;
  price_net_eur: number;
  in_stock: boolean | null;
  weight_kg: number | null;
  short_description: string;
  description: string | null;
  specs: { key: string; label: string; value: string; unit: string | null; is_filterable: boolean }[];
  safety_info: string;
  images: string[];
  documents?: { type: string; title: string; path: string }[];
  accessory_for?: string[];
}

interface NivelJson {
  // manufacturer_* = GPSR identification shown on the product page
  brand: { slug: string; name: string; website: string; manufacturer_name?: string; manufacturer_address?: string; manufacturer_email?: string };
  categories: { slug: string; name: string; parent_slug: string | null; description?: string; sort_order: number }[];
  products: NivelProduct[];
}

function must<T>(res: { data: T; error: { message: string } | null }, what: string): NonNullable<T> {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data as NonNullable<T>;
}

async function idsBySlug(table: string): Promise<Record<string, string>> {
  const rows = must(await db.from(table).select("id, slug").limit(5000), table);
  return Object.fromEntries(rows.map((r) => [r.slug, r.id]));
}

// Upserts the section and its subcategories, parents first. "meracia-technika" already exists (Makita, AG):
// it is moved to the top level, as in catalog.json.
async function syncCategories(categories: NivelJson["categories"]): Promise<Record<string, string>> {
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
            description: c.description ?? null,
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
  const existing = new Set(must(await db.storage.from(BUCKET).list(FOLDER, { limit: 1000 }), "list photos").map((o) => `${FOLDER}/${o.name}`));
  const todo = paths.filter((p) => !existing.has(p));
  for (const path of todo) {
    const file = `${PHOTO_DIR}/${path.slice(FOLDER.length + 1)}`;
    if (!existsSync(file)) throw new Error(`Photo missing on disk: ${file} (run scripts/nivel-catalog.py)`);
    must(
      await db.storage.from(BUCKET).upload(path, readFileSync(file), { contentType: "image/webp", cacheControl: "31536000" }),
      `upload ${path}`,
    );
  }
  console.log(`Photos: ${todo.length} uploaded, ${paths.length - todo.length} already in the bucket`);
}

async function main() {
  if (!existsSync(SOURCE)) throw new Error(`${SOURCE} is missing: run scripts/nivel-catalog.py`);
  const data: NivelJson = JSON.parse(readFileSync(SOURCE, "utf8"));
  const products = data.products;
  console.log(`Importing ${products.length} Nivel System products into ${url}`);

  const supplierId = must(await db.from("suppliers").upsert(SUPPLIER, { onConflict: "slug" }).select("id").single(), "supplier").id;
  // nivel.json carries the manufacturer details (GPSR) from nivelsystem.com, so they overwrite the brand row.
  must(await db.from("brands").upsert(data.brand, { onConflict: "slug" }).select("id"), "brand");
  const brandId = (await idsBySlug("brands"))[data.brand.slug];
  const categoryId = await syncCategories(data.categories);

  await uploadPhotos(products.flatMap((p) => p.images));

  const rows = must(
    await db
      .from("products")
      .upsert(
        products.map((p) => {
          if (!categoryId[p.category_slug]) throw new Error(`${p.slug}: unknown category ${p.category_slug}`);
          return {
            slug: p.slug,
            name: p.name,
            brand_id: brandId,
            supplier_id: supplierId,
            category_id: categoryId[p.category_slug],
            sku: p.sku,
            short_description: p.short_description,
            description: p.description,
            price_gross_cents: eurToCents(p.price_gross_eur),
            vat_rate: VAT_RATE,
            weight_kg: p.weight_kg,
            shipping_class: "courier",
            warranty_months: 24,
            safety_info: p.safety_info,
            status: "active",
            in_stock: p.in_stock,
            is_listed: true,
          };
        }),
        { onConflict: "slug" },
      )
      .select("id, slug"),
    "products",
  );
  const ids = Object.fromEntries(rows.map((r) => [r.slug, r.id]));
  const productIds = rows.map((r) => r.id);
  for (const table of ["product_specs", "product_images", "product_documents"])
    must(await db.from(table).delete().in("product_id", productIds).select("product_id"), `clear ${table}`);
  const specs = products.flatMap((p) => p.specs.map((s, i) => ({ ...s, product_id: ids[p.slug], sort_order: i })));
  const images = products.flatMap((p) => p.images.map((path, i) => ({ product_id: ids[p.slug], path, alt: p.name, sort_order: i })));
  const documents = products.flatMap((p) => (p.documents ?? []).map((d) => ({ ...d, product_id: ids[p.slug] })));
  must(await db.from("product_specs").insert(specs).select("id"), "specs");
  must(await db.from("product_images").insert(images).select("id"), "images");
  if (documents.length) must(await db.from("product_documents").insert(documents).select("id"), "documents");

  // Tripods and staffs on the instrument pages: exactly the pairs in nivel.json.
  const accessories = products.filter((p) => p.accessory_for);
  if (accessories.length) {
    must(
      await db.from("related_products").delete().eq("type", "accessory").in("related_id", accessories.map((a) => ids[a.slug])).select("related_id"),
      "clear accessories",
    );
    const pairs = accessories.flatMap((a) =>
      (a.accessory_for ?? []).map((slug) => {
        if (!ids[slug]) throw new Error(`${a.slug}: accessory_for points to ${slug}, which is not in nivel.json`);
        return { product_id: ids[slug], related_id: ids[a.slug], type: "accessory" };
      }),
    );
    if (pairs.length) must(await db.from("related_products").insert(pairs).select("product_id"), "accessories");
    console.log(`Accessories: ${accessories.length} tripods/staffs, ${pairs.length} instrument pairs, ${documents.length} documents`);
  }

  if (existsSync(COSTS)) {
    const { discount_pct } = JSON.parse(readFileSync(COSTS, "utf8")) as { discount_pct: number };
    if (!(discount_pct > 0 && discount_pct < 100)) throw new Error(`${COSTS}: discount_pct must be between 0 and 100`);
    const costs = products.map((p) => ({
      product_id: ids[p.slug],
      purchase_price_net_cents: Math.round(eurToCents(p.price_net_eur) * (1 - discount_pct / 100)),
    }));
    must(await db.from("product_costs").upsert(costs, { onConflict: "product_id" }).select("product_id"), "costs");
    console.log(`Purchase prices: ${costs.length} written to product_costs`);
  } else {
    console.log(`Purchase prices: ${COSTS} not found, product_costs left alone`);
  }

  // 3gon products that left the selection stay in old orders but disappear from the shop.
  const current = new Set(products.map((p) => p.slug));
  const active = must(
    await db.from("products").select("id, slug").eq("supplier_id", supplierId).eq("status", "active").limit(5000),
    "existing products",
  );
  const gone = active.filter((r) => !current.has(r.slug)).map((r) => r.id);
  if (gone.length) must(await db.from("products").update({ status: "archived" }).in("id", gone).select("id"), "archive");

  const inStock = products.filter((p) => p.in_stock).length;
  const unavailable = products.filter((p) => p.in_stock === false).length;
  console.log(
    `Done: ${products.length} products (${inStock} in stock, ${products.length - inStock - unavailable} on order, ${unavailable} unavailable), ${gone.length} archived.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
