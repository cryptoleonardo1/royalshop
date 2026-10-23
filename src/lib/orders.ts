import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canTransition, type OrderStatus, type ShippingMethod } from "./order-state";
import type { PricedProduct } from "./cart-pricing";
import { stripe } from "./stripe";

// Server-side order writes (service role). Status changes go through transitionOrder so the
// order-state rules and the status history can never be skipped.

type Db = SupabaseClient;

export interface OrderRef {
  id: string;
  status: OrderStatus;
  shipping_method: ShippingMethod;
}

export async function transitionOrder(
  db: Db,
  order: OrderRef,
  to: OrderStatus,
  opts: { note?: string; changedBy?: string | null; patch?: Record<string, unknown> } = {},
): Promise<boolean> {
  if (!canTransition(order.status, to, order.shipping_method)) {
    throw new Error(`Order ${order.id}: transition ${order.status} → ${to} not allowed`);
  }
  // Optimistic lock on the current status: a concurrent webhook/admin action wins, we back off.
  const { data, error } = await db
    .from("orders")
    .update({ status: to, ...opts.patch })
    .eq("id", order.id)
    .eq("status", order.status)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Order ${order.id}: status update failed: ${error.message}`);
  if (!data) return false;
  const history = await db.from("order_status_history").insert({
    order_id: order.id,
    from_status: order.status,
    to_status: to,
    changed_by: opts.changedBy ?? null,
    note: opts.note ?? null,
  });
  if (history.error) throw new Error(`Order ${order.id}: history insert failed: ${history.error.message}`);
  return true;
}

async function loadOrderRef(db: Db, orderId: string): Promise<OrderRef | null> {
  const { data, error } = await db.from("orders").select("id, status, shipping_method").eq("id", orderId).maybeSingle();
  if (error) throw new Error(`Order ${orderId}: load failed: ${error.message}`);
  return data as OrderRef | null;
}

// Paid (Stripe checkout.session.completed with payment_status "paid", or the demo payment). The card is
// charged at checkout (docs/06 §1.1); the contract is concluded later by "Potvrdenie objednávky".
// Idempotent: replays of the same event leave the order untouched.
export async function markOrderPaid(
  db: Db,
  orderId: string,
  payment: { checkoutSessionId: string; paymentIntentId: string | null },
  note: string,
): Promise<void> {
  const now = new Date().toISOString();
  const upd = await db
    .from("payments")
    .update({
      status: "captured",
      stripe_payment_intent_id: payment.paymentIntentId,
      authorized_at: now,
      captured_at: now,
    })
    .eq("stripe_checkout_session_id", payment.checkoutSessionId)
    .eq("status", "pending");
  if (upd.error) throw new Error(`Payment ${payment.checkoutSessionId}: update failed: ${upd.error.message}`);

  const order = await loadOrderRef(db, orderId);
  if (!order || order.status !== "pending_payment") return;
  await transitionOrder(db, order, "paid", { note, patch: { payment_status: "paid" } });
}

// A checkout session expired or its payment intent was cancelled. The order is cancelled only if
// no other payment attempt for it is still open (the customer may have retried).
export async function markPaymentAbandoned(db: Db, checkoutSessionId: string, note: string): Promise<void> {
  const { data: payment, error } = await db
    .from("payments")
    .update({ status: "cancelled" })
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .eq("status", "pending")
    .select("order_id")
    .maybeSingle();
  if (error) throw new Error(`Payment ${checkoutSessionId}: cancel failed: ${error.message}`);
  if (!payment) return;

  const open = await db
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("order_id", payment.order_id)
    .in("status", ["pending", "authorized", "captured"]);
  if (open.error) throw new Error(`Order ${payment.order_id}: payment check failed: ${open.error.message}`);
  if ((open.count ?? 0) > 0) return;

  const order = await loadOrderRef(db, payment.order_id);
  if (!order || order.status !== "pending_payment") return;
  await transitionOrder(db, order, "cancelled", { note, patch: { payment_status: "cancelled" } });
}

// charge.refunded: mirror the refunded amount (admin refund or one made directly in the Stripe dashboard).
// Money state only; the order status is changed by the admin action (cancel, withdrawal), never here.
export async function recordRefund(
  db: Db,
  charge: { payment_intent: string | { id: string } | null; amount: number; amount_refunded: number },
): Promise<void> {
  const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!pi) return;
  const full = charge.amount_refunded >= charge.amount;
  const { data: payment, error } = await db
    .from("payments")
    .update({ refunded_cents: charge.amount_refunded, status: full ? "refunded" : "partially_refunded" })
    .eq("stripe_payment_intent_id", pi)
    .select("order_id")
    .maybeSingle();
  if (error) throw new Error(`Payment ${pi}: refund update failed: ${error.message}`);
  if (!payment) return;
  const upd = await db
    .from("orders")
    .update({ payment_status: full ? "refunded" : "partially_refunded" })
    .eq("id", payment.order_id);
  if (upd.error) throw new Error(`Order ${payment.order_id}: refund status failed: ${upd.error.message}`);
}

// Current prices straight from the database (not the page cache): this is what an order is charged.
// Price-on-request products are left out, so a cart line for one is reported as no longer sold.
export async function fetchPricedProducts(
  db: Db,
  slugs: string[],
): Promise<Map<string, PricedProduct & { purchaseNetCents: number | null }>> {
  const map = new Map<string, PricedProduct & { purchaseNetCents: number | null }>();
  if (slugs.length === 0) return map;
  const { data, error } = await db
    .from("products")
    .select(
      `id, slug, name, sku, ean, price_gross_cents, vat_rate, shipping_class, weight_kg, supplier_id,
       supplier:suppliers(lead_time_days_max),
       images:product_images(path, sort_order),
       cost:product_costs(purchase_price_net_cents)`,
    )
    .in("slug", slugs.slice(0, 100))
    .eq("status", "active")
    .eq("price_on_request", false);
  if (error) throw new Error(`Pricing failed: ${error.message}`);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  for (const r of data as any[]) {
    const images = [...(r.images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
    const cost = Array.isArray(r.cost) ? r.cost[0] : r.cost;
    map.set(r.slug, {
      id: r.id,
      slug: r.slug,
      name: r.name,
      sku: r.sku,
      ean: r.ean,
      priceGrossCents: r.price_gross_cents,
      vatRate: Number(r.vat_rate),
      shippingClass: r.shipping_class,
      weightKg: r.weight_kg == null ? null : Number(r.weight_kg),
      leadDaysMax: r.supplier?.lead_time_days_max ?? 2,
      supplierId: r.supplier_id,
      image: images[0]?.path ?? null,
      purchaseNetCents: cost?.purchase_price_net_cents ?? null,
    });
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return map;
}

// Return from Stripe Checkout: confirm the session directly so the order page is right even before
// the webhook arrives (and locally, where webhooks are not forwarded). Same idempotent path.
export async function confirmCheckoutReturn(db: Db, orderId: string, sessionId: string): Promise<void> {
  if (!stripe || !sessionId.startsWith("cs_")) return;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.order_id !== orderId || session.status !== "complete" || session.payment_status !== "paid") return;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  await markOrderPaid(
    db,
    orderId,
    { checkoutSessionId: session.id, paymentIntentId },
    "Stripe: zaplatené (návrat z Checkout)",
  );
}
