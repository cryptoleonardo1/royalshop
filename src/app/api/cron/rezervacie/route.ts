import { createAdminClient } from "@/lib/supabase/admin";
import { expireReservations } from "@/lib/expire-reservations";

// Lapses reservations older than 10 working days. Not scheduled yet (manual cancel for now); to enable, add
// vercel.json { "crons": [{ "path": "/api/cron/rezervacie", "schedule": "0 5 * * *" }] }. Vercel sends
// "Authorization: Bearer $CRON_SECRET"; without the secret configured the route refuses to run.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("CRON_SECRET is not configured", { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });

  const result = await expireReservations(createAdminClient());
  return Response.json(result);
}
