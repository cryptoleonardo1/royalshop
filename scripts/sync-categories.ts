// Category tree of supabase/seed-data/catalog.json -> database, without touching products.
// Names, descriptions, parents and order are set; categories that are not in the file (AG, Nivel subcategories)
// are left alone. The product imports (import-makita.ts) sync the same tree, this is for a tree-only change.
//
//   npx tsx scripts/sync-categories.ts                                              (local, reads .env.local)
//   set -a; . ./.env.hosted.local; set +a; npx tsx scripts/sync-categories.ts       (hosted)

import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

const db = createClient(url, key, { auth: { persistSession: false } });

interface Category {
  slug: string;
  name: string;
  parent_slug: string | null;
  description?: string;
  sort_order?: number;
}

async function main() {
  const { categories } = JSON.parse(readFileSync("supabase/seed-data/catalog.json", "utf8")) as { categories: Category[] };
  console.log(`Syncing ${categories.length} categories into ${url}`);
  const existing = await db.from("categories").select("id, slug");
  if (existing.error) throw new Error(existing.error.message);
  const ids: Record<string, string> = Object.fromEntries(existing.data.map((r) => [r.slug, r.id]));
  const created = categories.filter((c) => !ids[c.slug]).map((c) => c.slug);

  const pending = [...categories];
  while (pending.length) {
    const ready = pending.filter((c) => !c.parent_slug || pending.every((p) => p.slug !== c.parent_slug));
    if (!ready.length) throw new Error("Category parents unresolved: " + pending.map((c) => c.slug).join(", "));
    const res = await db
      .from("categories")
      .upsert(
        ready.map((c, i) => {
          if (c.parent_slug && !ids[c.parent_slug]) throw new Error(`${c.slug}: unknown parent ${c.parent_slug}`);
          return {
            slug: c.slug,
            name: c.name,
            description: c.description ?? null,
            parent_id: c.parent_slug ? ids[c.parent_slug] : null,
            sort_order: c.sort_order ?? i,
          };
        }),
        { onConflict: "slug" },
      )
      .select("id, slug");
    if (res.error) throw new Error(res.error.message);
    res.data.forEach((r) => (ids[r.slug] = r.id));
    ready.forEach((c) => pending.splice(pending.indexOf(c), 1));
  }
  console.log(`Done: ${categories.length} categories, new: ${created.join(", ") || "none"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
