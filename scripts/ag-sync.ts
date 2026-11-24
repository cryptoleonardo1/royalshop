// AG náradie stock and price sync by hand (the same code runs daily at /api/cron/ag-sklad).
//
//   npx tsx scripts/ag-sync.ts                                              (local, reads .env.local)
//   set -a; . ./.env.hosted.local; set +a; npx tsx scripts/ag-sync.ts       (hosted)
//
// Reads the price feed from AG_PRICE_FEED_URL, or from a downloaded file given as the first argument. The
// storefront cache is not cleared from here: the change shows within the hour (cacheLife "hours").

import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { fetchAgPriceFeed, syncAgStock } from "../src/lib/ag-sync";

config({ path: ".env.local" });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  const file = process.argv[2];
  const feedUrl = process.env.AG_PRICE_FEED_URL;
  if (!file && !feedUrl) throw new Error("Give a feed file or set AG_PRICE_FEED_URL");
  const xml = file ? readFileSync(file, "utf8") : await fetchAgPriceFeed(feedUrl!);
  const db = createClient(url, key, { auth: { persistSession: false } });
  console.log(`AG sync into ${url}`);
  console.log(await syncAgStock(db, xml));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
