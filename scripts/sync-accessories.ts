// Accessories of supabase/seed-data/catalog.json (products with "accessory_for") -> database, without wiping the
// catalog the way scripts/seed.ts does. Products are upserted by slug (price, texts, specs, photos, purchase
// price), and each accessory's related_products rows of type 'accessory' are replaced by its "accessory_for"
// list, so the machine page offers exactly the parts the supplier's price list names for that model.
//
//   npx tsx scripts/sync-accessories.ts ntc                                              (local, reads .env.local)
//   set -a; . ./.env.hosted.local; set +a; npx tsx scripts/sync-accessories.ts ntc       (hosted)
//
// Arguments = brand slugs to sync (none = every accessory in catalog.json). Machines named in accessory_for must
// already exist. Photos are paths under public/ (/demo-products/...), deployed with the app.

import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { eurToCents } from "../src/lib/money";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
const db = createClient(url, key, { auth: { persistSession: false } });

interface CatalogProduct {
  slug: string;
  name: string;
  brand_slug: string;
  supplier_slug: string;
  category_slug: string;
  sku: string | null;
  ean: string | null;
  short_description: string;
  description: string;
  price_gross_eur: number;
  compare_at_price_eur: number | null;
  purchase_price_net_eur: number;
  vat_rate: number;
  weight_kg: number | null;
  shipping_class: string;
  battery_platform: string;
  is_kit: boolean;
  warranty_months: number;
  manufacturer_warranty_note: string | null;
  safety_info: string;
  is_featured: boolean;
  rental_url: string | null;
  price_on_request?: boolean;
  specs: { key: string; label: string; value: string; unit: string | null; is_filterable: boolean }[];
  images: string[];
  accessory_for?: string[];
}

function must<T>(res: { data: T; error: { message: string } | null }, what: string): NonNullable<T> {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data as NonNullable<T>;
}

async function idsBySlug(table: string, slugs: string[]): Promise<Record<string, string>> {
  const rows = must(await db.from(table).select("id, slug").in("slug", [...new Set(slugs)]), table);
  return Object.fromEntries(rows.map((r) => [r.slug, r.id]));
}

async function main() {
  const brands = process.argv.slice(2);
  const catalog: { products: CatalogProduct[] } = JSON.parse(readFileSync("supabase/seed-data/catalog.json", "utf8"));
  const accessories = catalog.products.filter(
    (p) => p.accessory_for?.length && (!brands.length || brands.includes(p.brand_slug)),
  );
  if (!accessories.length) throw new Error(`No accessories with accessory_for for ${brands.join(", ") || "any brand"}`);
  console.log(`Syncing ${accessories.length} accessories into ${url}`);

  const brandId = await idsBySlug("brands", accessories.map((p) => p.brand_slug));
  const supplierId = await idsBySlug("suppliers", accessories.map((p) => p.supplier_slug));
  const categoryId = await idsBySlug("categories", accessories.map((p) => p.category_slug));
  const machineId = await idsBySlug("products", accessories.flatMap((p) => p.accessory_for ?? []));
  for (const p of accessories) {
    for (const [what, ids, slug] of [
      ["brand", brandId, p.brand_slug],
      ["supplier", supplierId, p.supplier_slug],
      ["category", categoryId, p.category_slug],
    ] as const)
      if (!ids[slug]) throw new Error(`${p.slug}: ${what} ${slug} is not in the database`);
    for (const m of p.accessory_for ?? []) if (!machineId[m]) throw new Error(`${p.slug}: machine ${m} is not in the database`);
  }

  const rows = must(
    await db
      .from("products")
      .upsert(
        accessories.map((p) => ({
          slug: p.slug,
          name: p.name,
          brand_id: brandId[p.brand_slug],
          supplier_id: supplierId[p.supplier_slug],
          category_id: categoryId[p.category_slug],
          sku: p.sku,
          ean: p.ean,
          short_description: p.short_description,
          description: p.description,
          price_gross_cents: eurToCents(p.price_gross_eur),
          compare_at_price_cents: p.compare_at_price_eur == null ? null : eurToCents(p.compare_at_price_eur),
          vat_rate: p.vat_rate,
          weight_kg: p.weight_kg,
          shipping_class: p.shipping_class,
          battery_platform: p.battery_platform,
          is_kit: p.is_kit,
          warranty_months: p.warranty_months,
          manufacturer_warranty_note: p.manufacturer_warranty_note,
          safety_info: p.safety_info,
          is_featured: p.is_featured,
          rental_url: p.rental_url,
          price_on_request: p.price_on_request ?? false,
          status: "active",
        })),
        { onConflict: "slug" },
      )
      .select("id, slug"),
    "products",
  );
  const ids = Object.fromEntries(rows.map((r) => [r.slug, r.id]));
  const productIds = rows.map((r) => r.id);

  for (const table of ["product_specs", "product_images"])
    must(await db.from(table).delete().in("product_id", productIds).select("product_id"), `clear ${table}`);
  const specs = accessories.flatMap((p) => p.specs.map((s, i) => ({ ...s, product_id: ids[p.slug], sort_order: i })));
  const images = accessories.flatMap((p) => p.images.map((path, i) => ({ product_id: ids[p.slug], path, alt: p.name, sort_order: i })));
  if (specs.length) must(await db.from("product_specs").insert(specs).select("id"), "specs");
  if (images.length) must(await db.from("product_images").insert(images).select("id"), "images");
  must(
    await db
      .from("product_costs")
      .upsert(
        accessories.map((p) => ({ product_id: ids[p.slug], purchase_price_net_cents: eurToCents(p.purchase_price_net_eur) })),
        { onConflict: "product_id" },
      )
      .select("product_id"),
    "costs",
  );

  must(
    await db.from("related_products").delete().eq("type", "accessory").in("related_id", productIds).select("related_id"),
    "clear pairs",
  );
  const pairs = accessories.flatMap((p) =>
    (p.accessory_for ?? []).map((m) => ({ product_id: machineId[m], related_id: ids[p.slug], type: "accessory" })),
  );
  must(await db.from("related_products").insert(pairs).select("product_id"), "pairs");

  const machines = new Set(accessories.flatMap((p) => p.accessory_for ?? []));
  console.log(`Done: ${accessories.length} accessories (${images.length} photos), ${pairs.length} pairs on ${machines.size} machines.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
