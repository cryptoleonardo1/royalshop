import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAgPriceFeed, syncAgStock } from "@/lib/ag-sync";

// Daily stock and price sync for the AG náradie range (vercel.json crons). Needs two environment variables in
// Vercel: CRON_SECRET (Vercel sends "Authorization: Bearer $CRON_SECRET") and AG_PRICE_FEED_URL (the
// cennik_export.xml address; it carries our access token, so it is never committed). Without them the route
// refuses to run. When the feed is down or looks broken nothing changes and the route answers 502.
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const feedUrl = process.env.AG_PRICE_FEED_URL;
  if (!secret) return new Response("CRON_SECRET is not configured", { status: 503 });
  if (!feedUrl) return new Response("AG_PRICE_FEED_URL is not configured", { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await syncAgStock(createAdminClient(), await fetchAgPriceFeed(feedUrl));
    if (result.stockChanged || result.priceChanged) revalidateTag("catalog", "max");
    return Response.json(result);
  } catch (e) {
    console.error(e);
    return Response.json({ error: e instanceof Error ? e.message : "AG sync failed" }, { status: 502 });
  }
}
