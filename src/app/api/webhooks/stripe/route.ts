import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { markPaymentAbandoned, markPaymentAuthorized } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

// Stripe → order state. Every event is stored once in payment_events (idempotency); handlers are
// idempotent too, so a retried or out-of-order delivery never moves an order twice.

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe is not configured", { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const db = createAdminClient();
  const seen = await db
    .from("payment_events")
    .insert({ stripe_event_id: event.id, type: event.type, payload: event as unknown as Record<string, unknown> });
  if (seen.error) {
    // 23505 = already processed
    if (seen.error.code === "23505") return Response.json({ received: true, duplicate: true });
    return new Response("Event log failed", { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          const pi =
            typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
          await markPaymentAuthorized(
            db,
            orderId,
            { checkoutSessionId: session.id, paymentIntentId: pi },
            "Stripe: platba autorizovaná",
          );
        }
        break;
      }
      case "checkout.session.expired":
        await markPaymentAbandoned(db, event.data.object.id, "Stripe: platobná relácia vypršala");
        break;
      default:
        // payment_intent.canceled, charge.refunded… are handled once admin capture/refund exists
        break;
    }
  } catch (err) {
    // let Stripe retry: forget the event so the retry is processed
    await db.from("payment_events").delete().eq("stripe_event_id", event.id);
    console.error("stripe webhook failed", event.type, err);
    return new Response("Handler failed", { status: 500 });
  }

  return Response.json({ received: true });
}
