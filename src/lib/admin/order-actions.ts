"use server";

import { refresh } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { canTransition, ORDER_STATUS_LABELS, type OrderStatus, type ShippingMethod } from "@/lib/order-state";
import { transitionOrder } from "@/lib/orders";
import { isDemoPayments, stripe } from "@/lib/stripe";
import { canCompleteOrder, withdrawalDeadline } from "@/lib/withdrawal";
import { bratislavaDay, bratislavaMidnight } from "@/lib/sk-calendar";
import { requireAdmin } from "./auth";

// Admin order writes. Each action authorizes itself, then writes with the service role; status changes
// only through transitionOrder (order-state rules + status history).

export type ActionState = { ok?: boolean; message?: string } | undefined;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

interface LoadedOrder {
  id: string;
  order_number: string;
  status: OrderStatus;
  shipping_method: ShippingMethod;
  customer_type: "person" | "company";
  payment_status: string;
  delivered_at: string | null;
  withdrawal_deadline: string | null;
}

async function loadOrder(db: ReturnType<typeof createAdminClient>, id: string): Promise<LoadedOrder | null> {
  const { data, error } = await db
    .from("orders")
    .select("id, order_number, status, shipping_method, customer_type, payment_status, delivered_at, withdrawal_deadline")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Order ${id}: load failed: ${error.message}`);
  return data as LoadedOrder | null;
}

const STALE = "Objednávku medzitým zmenil niekto iný. Obnovte stránku.";

export async function advanceOrder(_prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const db = createAdminClient();
  const order = await loadOrder(db, text(form, "orderId"));
  if (!order) return { message: "Objednávka neexistuje." };
  const to = text(form, "to") as OrderStatus;
  if (text(form, "from") !== order.status) return { message: STALE };
  if (to === "cancelled" || !canTransition(order.status, to, order.shipping_method)) {
    return { message: `Zo stavu „${ORDER_STATUS_LABELS[order.status]}“ sa nedá prejsť na „${ORDER_STATUS_LABELS[to] ?? to}“.` };
  }

  const note = text(form, "note") || undefined;
  const patch: Record<string, unknown> = {};
  const now = new Date();

  if (to === "delivered") {
    // <input type="date">: the Bratislava day of delivery; today means "now", an earlier day noon local time
    const raw = text(form, "deliveredAt");
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (raw && !m) return { message: "Neplatný dátum doručenia." };
    const today = bratislavaDay(now);
    const day = m ? { y: +m[1], m: +m[2], d: +m[3] } : today;
    const isToday = day.y === today.y && day.m === today.m && day.d === today.d;
    const deliveredAt = isToday ? now : new Date(bratislavaMidnight(day).getTime() + 12 * 3_600_000);
    if (deliveredAt.getTime() > now.getTime()) return { message: "Dátum doručenia nemôže byť v budúcnosti." };
    patch.delivered_at = deliveredAt.toISOString();
    patch.withdrawal_deadline =
      order.customer_type === "person" ? withdrawalDeadline(deliveredAt).toISOString() : null;
  }
  if (to === "completed" && !canCompleteOrder(order, now)) {
    return { message: "Spotrebiteľovi ešte plynie lehota na odstúpenie (vrátane rezervy na poštu)." };
  }
  if (to === "shipped" && !text(form, "carrier")) return { message: "Zadajte dopravcu." };
  if (to === "confirmed") {
    const captured = await captureHeldPayments(db, order);
    if (captured !== true) return { message: captured };
    patch.payment_status = "paid";
  }

  const moved = await transitionOrder(db, order, to, { note, changedBy: admin.id, patch });
  if (!moved) return { message: STALE };

  // Side records of the step (best effort: the status change itself is already saved).
  const side = await recordStepDetails(db, order, to, form, patch.delivered_at as string | undefined);
  refresh();
  return side ? { ok: true, message: side } : { ok: true };
}

// Orders paid before 2026-10-23 hold the money on the card (manual capture). Confirming such an order
// charges the hold; new orders are charged at checkout and pass straight through.
async function captureHeldPayments(db: ReturnType<typeof createAdminClient>, order: LoadedOrder): Promise<true | string> {
  const { data: held, error } = await db
    .from("payments")
    .select("id, stripe_payment_intent_id")
    .eq("order_id", order.id)
    .eq("status", "authorized");
  if (error) return `Platby sa nepodarilo načítať: ${error.message}`;
  for (const p of held ?? []) {
    if (p.stripe_payment_intent_id?.startsWith("pi_") && stripe) {
      try {
        await stripe.paymentIntents.capture(p.stripe_payment_intent_id, {}, { idempotencyKey: `order-capture-${p.id}` });
      } catch (err) {
        return `Zablokovanú platbu sa nepodarilo stiahnuť (blokácia mohla vypršať po 7 dňoch): ${(err as Error).message}`;
      }
    } else if (!isDemoPayments) {
      return "Zablokovanú platbu nemožno stiahnuť automaticky. Riešte ručne v Stripe.";
    }
    const upd = await db
      .from("payments")
      .update({ status: "captured", captured_at: new Date().toISOString() })
      .eq("id", p.id);
    if (upd.error) return `Platba je stiahnutá, no nepodarilo sa ju uložiť: ${upd.error.message}`;
  }
  return true;
}

async function recordStepDetails(
  db: ReturnType<typeof createAdminClient>,
  order: LoadedOrder,
  to: OrderStatus,
  form: FormData,
  deliveredAt: string | undefined,
): Promise<string | undefined> {
  const fail = (what: string, err: { message: string } | null) =>
    err ? `Stav je uložený, ale ${what} sa nepodarilo uložiť: ${err.message}` : undefined;

  if (to === "ordered_from_supplier") {
    const { data: items } = await db.from("order_items").select("supplier_id").eq("order_id", order.id);
    const suppliers = [...new Set((items ?? []).map((i) => i.supplier_id).filter(Boolean))] as string[];
    if (suppliers.length === 0) return undefined;
    const expected = text(form, "expectedAt") || null;
    const { error } = await db.from("supplier_orders").insert(
      suppliers.map((supplier_id) => ({
        order_id: order.id,
        supplier_id,
        reference: text(form, "reference") || null,
        expected_at: expected,
      })),
    );
    return fail("objednávku u dodávateľa", error);
  }
  if (to === "received_at_branch") {
    const { error } = await db
      .from("supplier_orders")
      .update({ received_at: new Date().toISOString() })
      .eq("order_id", order.id)
      .is("received_at", null);
    return fail("prijatie od dodávateľa", error);
  }
  if (to === "shipped" || to === "out_for_delivery") {
    const { error } = await db.from("shipments").insert({
      order_id: order.id,
      carrier: to === "shipped" ? text(form, "carrier") : "Royal Stroje (vlastný rozvoz)",
      tracking_number: text(form, "trackingNumber") || null,
      tracking_url: text(form, "trackingUrl") || null,
    });
    return fail("zásielku", error);
  }
  if (to === "delivered" && deliveredAt) {
    const { error } = await db
      .from("shipments")
      .update({ delivered_at: deliveredAt })
      .eq("order_id", order.id)
      .is("delivered_at", null);
    return fail("doručenie zásielky", error);
  }
  return undefined;
}

// Cancel before the goods arrived (state machine allows it up to "ordered_from_supplier"). A paid order is
// refunded in full, shipping included (VOP: within 2 working days); an open Stripe session is expired.
export async function cancelOrder(_prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const db = createAdminClient();
  const order = await loadOrder(db, text(form, "orderId"));
  if (!order) return { message: "Objednávka neexistuje." };
  if (text(form, "from") !== order.status) return { message: STALE };
  if (!canTransition(order.status, "cancelled", order.shipping_method)) {
    return { message: "V tomto stave sa objednávka už nedá zrušiť. Ide o odstúpenie alebo reklamáciu." };
  }
  const reason = text(form, "reason");
  if (!reason) return { message: "Uveďte dôvod zrušenia." };
  if (form.get("confirm") !== "on") return { message: "Potvrďte, že rozumiete dôsledkom zrušenia." };

  const { count: invoices } = await db
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id)
    .eq("status", "issued");
  if ((invoices ?? 0) > 0) return { message: "K objednávke je vystavená faktúra. Zrušenie s dobropisom príde s modulom faktúr." };

  const { data: payments, error } = await db
    .from("payments")
    .select("id, status, amount_cents, refunded_cents, stripe_checkout_session_id, stripe_payment_intent_id")
    .eq("order_id", order.id);
  if (error) return { message: `Platby sa nepodarilo načítať: ${error.message}` };

  let refundedCents = 0;
  for (const p of payments ?? []) {
    if (p.status === "pending" && stripe && p.stripe_checkout_session_id?.startsWith("cs_")) {
      try {
        await stripe.checkout.sessions.expire(p.stripe_checkout_session_id);
      } catch {
        // already expired or completed: the webhook reconciles a late completion
      }
      await db.from("payments").update({ status: "cancelled" }).eq("id", p.id).eq("status", "pending");
      continue;
    }
    // legacy manual-capture hold (before 2026-10-23): release it, nothing was charged
    if (p.status === "authorized") {
      if (p.stripe_payment_intent_id?.startsWith("pi_") && stripe) {
        try {
          await stripe.paymentIntents.cancel(p.stripe_payment_intent_id, { cancellation_reason: "requested_by_customer" });
        } catch (err) {
          // an expired hold is already released by Stripe
          if (!/canceled|expired/i.test((err as Error).message)) {
            return { message: `Blokáciu v Stripe sa nepodarilo uvoľniť: ${(err as Error).message}` };
          }
        }
      }
      await db.from("payments").update({ status: "cancelled" }).eq("id", p.id);
      continue;
    }
    if (p.status !== "captured" && p.status !== "partially_refunded") continue;
    const remaining = p.amount_cents - (p.refunded_cents ?? 0);
    if (remaining <= 0) continue;
    if (p.stripe_payment_intent_id?.startsWith("pi_") && stripe) {
      try {
        await stripe.refunds.create(
          {
            payment_intent: p.stripe_payment_intent_id,
            amount: remaining,
            reason: "requested_by_customer",
            metadata: { order_id: order.id, order_number: order.order_number, cancelled_by: admin.email },
          },
          { idempotencyKey: `order-cancel-${p.id}-${remaining}` },
        );
      } catch (err) {
        return { message: `Stripe refund zlyhal, objednávka zostáva nezmenená: ${(err as Error).message}` };
      }
    } else if (!isDemoPayments) {
      return { message: "Platbu nemožno vrátiť automaticky (chýba Stripe platba). Riešte ručne v Stripe." };
    }
    const upd = await db
      .from("payments")
      .update({ status: "refunded", refunded_cents: p.amount_cents })
      .eq("id", p.id);
    if (upd.error) return { message: `Refund prebehol, no platbu sa nepodarilo uložiť: ${upd.error.message}` };
    refundedCents += remaining;
  }

  const moved = await transitionOrder(db, order, "cancelled", {
    note: `Zrušené: ${reason}${refundedCents > 0 ? ` (vrátené ${(refundedCents / 100).toFixed(2)} €)` : ""}`,
    changedBy: admin.id,
    patch: { payment_status: refundedCents > 0 || order.payment_status === "paid" ? "refunded" : "cancelled" },
  });
  if (!moved) return { message: STALE };
  refresh();
  return { ok: true };
}

export async function saveAdminNote(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("orders")
    .update({ admin_note: text(form, "adminNote") || null })
    .eq("id", text(form, "orderId"));
  if (error) return { message: `Poznámku sa nepodarilo uložiť: ${error.message}` };
  refresh();
  return { ok: true, message: "Uložené." };
}
