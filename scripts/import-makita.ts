// Makita machines: supabase/seed-data/makita.json -> database, photos -> Storage bucket "product-images".
// The JSON and the photos come from scripts/makita-catalog.py (Makita's daily export + makita.sk).
//
//   npx tsx scripts/import-makita.ts                                              (local, reads .env.local)
//   set -a; . ./.env.hosted.local; set +a; npx tsx scripts/import-makita.ts       (hosted)
//
// Safe to re-run: products are matched by slug, their specs, photos and documents are replaced, prices and
// stock are updated, and Makita products that left the export are archived. Promotion mode (used 2026-11-24 to
// 2026-11-26, off since: no discounts until a month after launch): supabase/seed-data/makita-akcia.json lists codes and selling
// prices (built from the promotion workbook by the git-ignored docs/cenniky/makita-akcia.py), every other
// Makita machine is archived. Purchase prices go to product_costs when the git-ignored
// docs/cenniky/data/makita-akcia-naklady.json is on disk. Delete makita-akcia.json to import the whole export
// at Makita's MOC again. Run the import again after
// `scripts/seed.ts`, which wipes the catalog. Without a promotion file selling prices are Makita's MOC and no
// product_costs rows are written.

import { config } from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { eurToCents } from "../src/lib/money";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key)
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
  );

const db = createClient(url, key, { auth: { persistSession: false } });

const BRAND = "makita";
const BUCKET = "product-images";
const PHOTO_DIR = "originals/makita/img";
const PROMO_FILE = "supabase/seed-data/makita-akcia.json";
const PROMO_COSTS_FILE = "docs/cenniky/data/makita-akcia-naklady.json";
const CHUNK = 100;
// Shown as "Odporúčame" on the home page and first in the default sort (changed 2026-11-12: winter picks).
const FEATURED = new Set(["makita-tw001gu201", "makita-duc254z", "makita-dhg180zk"]);

const SAFETY_INFO =
  "Pred použitím si prečítajte návod na použitie a bezpečnostné pokyny. Používajte ochranu zraku, sluchu a dýchacích ciest a pracovné rukavice podľa druhu práce. Pred výmenou nástroja alebo údržbou vyberte akumulátor alebo odpojte stroj od siete.";
const WARRANTY_NOTE =
  "Makita predlžuje záruku na 3 roky po registrácii stroja na warranty.makita.eu (podmienky určuje Makita).";

interface MakitaProduct {
  slug: string;
  sku: string;
  ean: string | null;
  name: string;
  category_slug: string;
  short_description: string;
  description: string | null;
  price_gross_eur: number;
  in_stock: boolean;
  weight_kg: number | null;
  battery_platform: string;
  is_kit: boolean;
  extended_warranty: boolean;
  specs: {
    key: string;
    label: string;
    value: string;
    unit: string | null;
    is_filterable: boolean;
  }[];
  images: string[];
  documents: { type: string; title: string; path: string }[];
}

interface CatalogJson {
  suppliers: ({ slug: string } & Record<string, unknown>)[];
  brands: ({ slug: string } & Record<string, unknown>)[];
  categories: {
    slug: string;
    name: string;
    parent_slug: string | null;
    description?: string;
    sort_order?: number;
  }[];
}

function must<T>(
  res: { data: T; error: { message: string } | null },
  what: string,
): NonNullable<T> {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data as NonNullable<T>;
}

const chunks = <T>(list: T[], size = CHUNK): T[][] =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) =>
    list.slice(i * size, (i + 1) * size),
  );

// Categories live in catalog.json (one source for the seed and for this import); missing ones are created
// and parents are set, so the tree on a database seeded earlier matches the file.
async function syncCategories(
  categories: CatalogJson["categories"],
): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};
  const pending = [...categories];
  while (pending.length) {
    const ready = pending.filter((c) => !c.parent_slug || ids[c.parent_slug]);
    if (!ready.length)
      throw new Error(
        "Category parents unresolved: " + pending.map((c) => c.slug).join(", "),
      );
    const rows = must(
      await db
        .from("categories")
        .upsert(
          ready.map((c, i) => ({
            slug: c.slug,
            name: c.name,
            description: c.description ?? null,
            parent_id: c.parent_slug ? ids[c.parent_slug] : null,
            sort_order: c.sort_order ?? i,
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
    const page = must(
      await db.storage.from(BUCKET).list(BRAND, { limit: 1000, offset }),
      "list photos",
    );
    page.forEach((o) => existing.add(`${BRAND}/${o.name}`));
    if (page.length < 1000) break;
  }
  const todo = paths.filter((p) => !existing.has(p));
  let done = 0;
  for (const batch of chunks(todo, 8)) {
    await Promise.all(
      batch.map(async (path) => {
        const file = `${PHOTO_DIR}/${path.slice(BRAND.length + 1)}`;
        if (!existsSync(file))
          throw new Error(
            `Photo missing on disk: ${file} (run scripts/makita-catalog.py)`,
          );
        must(
          await db.storage
            .from(BUCKET)
            .upload(path, readFileSync(file), {
              contentType: "image/webp",
              cacheControl: "31536000",
            }),
          `upload ${path}`,
        );
      }),
    );
    done += batch.length;
    if (done % 200 < 8) console.log(`  photos ${done}/${todo.length}`);
  }
  console.log(
    `Photos: ${todo.length} uploaded, ${paths.length - todo.length} already in the bucket`,
  );
}

async function main() {
  const catalog: CatalogJson = JSON.parse(
    readFileSync("supabase/seed-data/catalog.json", "utf8"),
  );
  const all: MakitaProduct[] = JSON.parse(
    readFileSync("supabase/seed-data/makita.json", "utf8"),
  ).products;
  // code -> selling price incl. VAT
  const promo: Record<string, number> | null = existsSync(PROMO_FILE)
    ? JSON.parse(readFileSync(PROMO_FILE, "utf8")).prices
    : null;
  const products = promo
    ? all
        .filter((p) => promo[p.sku.toUpperCase()] != null)
        .map((p) => ({ ...p, price_gross_eur: promo[p.sku.toUpperCase()], moc_gross_eur: p.price_gross_eur }))
    : all.map((p) => ({ ...p, moc_gross_eur: p.price_gross_eur }));
  console.log(
    `Importing ${products.length} Makita machines into ${url}` +
      (promo
        ? ` (promotion only: ${Object.keys(promo).length} codes, ${all.length} machines in the export)`
        : ""),
  );

  const supplier = catalog.suppliers.find((s) => s.slug === BRAND);
  const brand = catalog.brands.find((b) => b.slug === BRAND);
  if (!supplier || !brand)
    throw new Error("catalog.json has no makita supplier / brand");
  const supplierId = must(
    await db
      .from("suppliers")
      .upsert(supplier, { onConflict: "slug" })
      .select("id")
      .single(),
    "supplier",
  ).id;
  const brandId = must(
    await db
      .from("brands")
      .upsert(brand, { onConflict: "slug" })
      .select("id")
      .single(),
    "brand",
  ).id;
  const categoryId = await syncCategories(catalog.categories);

  await uploadPhotos(products.flatMap((p) => p.images));

  const ids: Record<string, string> = {};
  for (const batch of chunks(products)) {
    const rows = must(
      await db
        .from("products")
        .upsert(
          batch.map((p) => {
            if (!categoryId[p.category_slug])
              throw new Error(`${p.slug}: unknown category ${p.category_slug}`);
            return {
              slug: p.slug,
              name: p.name,
              brand_id: brandId,
              supplier_id: supplierId,
              category_id: categoryId[p.category_slug],
              sku: p.sku,
              ean: p.ean,
              short_description: p.short_description,
              description: p.description,
              price_gross_cents: eurToCents(p.price_gross_eur),
              // Promotion price below Makita's MOC: the MOC is shown crossed out. The discount itself is
              // measured against the lowest price of the last 30 days (price_history), as the law asks.
              compare_at_price_cents:
                p.moc_gross_eur > p.price_gross_eur ? eurToCents(p.moc_gross_eur) : null,
              vat_rate: 23,
              weight_kg: p.weight_kg,
              shipping_class: "courier",
              battery_platform: p.battery_platform,
              is_kit: p.is_kit,
              warranty_months: 24,
              manufacturer_warranty_note: p.extended_warranty
                ? WARRANTY_NOTE
                : null,
              safety_info: SAFETY_INFO,
              status: "active",
              in_stock: p.in_stock,
              is_featured: FEATURED.has(p.slug),
            };
          }),
          { onConflict: "slug" },
        )
        .select("id, slug"),
      "products",
    );
    rows.forEach((r) => (ids[r.slug] = r.id));

    const batchIds = rows.map((r) => r.id);
    for (const table of [
      "product_specs",
      "product_images",
      "product_documents",
    ]) {
      must(
        await db
          .from(table)
          .delete()
          .in("product_id", batchIds)
          .select("product_id"),
        `clear ${table}`,
      );
    }
    const specs = batch.flatMap((p) =>
      p.specs.map((s, i) => ({ ...s, product_id: ids[p.slug], sort_order: i })),
    );
    const images = batch.flatMap((p) =>
      p.images.map((path, i) => ({
        product_id: ids[p.slug],
        path,
        alt: p.name,
        sort_order: i,
      })),
    );
    const documents = batch.flatMap((p) =>
      p.documents.map((d) => ({ ...d, product_id: ids[p.slug] })),
    );
    for (const part of chunks(specs, 500))
      must(await db.from("product_specs").insert(part).select("id"), "specs");
    if (images.length)
      must(
        await db.from("product_images").insert(images).select("id"),
        "images",
      );
    if (documents.length)
      must(
        await db.from("product_documents").insert(documents).select("id"),
        "documents",
      );
    console.log(`  products ${Object.keys(ids).length}/${products.length}`);
  }

  // Purchase prices of the promotion (admin-only table); the file is not in the repo.
  if (promo && existsSync(PROMO_COSTS_FILE)) {
    const costs: Record<string, number> = JSON.parse(readFileSync(PROMO_COSTS_FILE, "utf8"));
    const rows = products
      .filter((p) => costs[p.sku.toUpperCase()] != null)
      .map((p) => ({ product_id: ids[p.slug], purchase_price_net_cents: costs[p.sku.toUpperCase()] }));
    for (const batch of chunks(rows))
      must(await db.from("product_costs").upsert(batch, { onConflict: "product_id" }).select("product_id"), "costs");
    console.log(`Purchase prices: ${rows.length} written to product_costs`);
  }

  // Machines that left Makita's export or the promotion stay in old orders but disappear from the shop.
  // Scoped by supplier: Makita tools that come from another supplier's feed are not this import's business.
  const current = must(
    await db
      .from("products")
      .select("id, slug")
      .eq("brand_id", brandId)
      .eq("supplier_id", supplierId)
      .eq("status", "active")
      .limit(5000),
    "current",
  );
  const gone = current.filter((r) => !ids[r.slug]).map((r) => r.id);
  for (const batch of chunks(gone))
    must(
      await db
        .from("products")
        .update({ status: "archived" })
        .in("id", batch)
        .select("id"),
      "archive",
    );

  const inStock = products.filter((p) => p.in_stock).length;
  console.log(
    `Done: ${products.length} machines (${inStock} in stock, ${products.length - inStock} not), ${gone.length} archived.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
