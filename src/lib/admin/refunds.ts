import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isDemoPayments, stripe } from "@/lib/stripe";

// Card refunds of captured payments (order cancel, withdrawal). Callers authorize with requireAdmin() first.
// Each Stripe call has an idempotency key, so a double submit cannot refund twice. The charge.refunded
// webhook mirrors the same amounts again (recordRefund), which is harmless.

const REFUNDABLE = ["captured", "partially_refunded"];

export async function refundableCents(db: SupabaseClient, orderId: string): Promise<number> {
  const { data, error } = await db
    .from("payments")
    .select("status, amount_cents, refunded_cents")
    .eq("order_id", orderId);
  if (error) throw new Error(`Order ${orderId}: payments load failed: ${error.message}`);
  return (data ?? [])
    .filter((p) => REFUNDABLE.includes(p.status))
    .reduce((sum, p) => sum + p.amount_cents - (p.refunded_cents ?? 0), 0);
}

// Refunds `amountCents` (null = everything still refundable) across the order's captured payments.
export async function refundCaptured(
  db: SupabaseClient,
  order: { id: string; order_number: string },
  amountCents: number | null,
  opts: { keyPrefix: string; metadata: Record<string, string> },
): Promise<{ ok: true; refundedCents: number } | { ok: false; message: string; refundedCents: number }> {
  const { data: payments, error } = await db
    .from("payments")
    .select("id, status, amount_cents, refunded_cents, stripe_payment_intent_id")
    .eq("order_id", order.id)
    .in("status", REFUNDABLE)
    .order("created_at");
  if (error) return { ok: false, message: `Platby sa nepodarilo načítať: ${error.message}`, refundedCents: 0 };

  let left = amountCents ?? Number.POSITIVE_INFINITY;
  let refundedCents = 0;
  for (const p of payments ?? []) {
    if (left <= 0) break;
    const remaining = p.amount_cents - (p.refunded_cents ?? 0);
    const take = Math.min(remaining, left);
    if (take <= 0) continue;
    if (p.stripe_payment_intent_id?.startsWith("pi_") && stripe) {
      try {
        await stripe.refunds.create(
          {
            payment_intent: p.stripe_payment_intent_id,
            amount: take,
            reason: "requested_by_customer",
            metadata: { order_id: order.id, order_number: order.order_number, ...opts.metadata },
          },
          { idempotencyKey: `${opts.keyPrefix}-${p.id}-${take}` },
        );
      } catch (err) {
        const done = refundedCents > 0 ? ` Už vrátené: ${(refundedCents / 100).toFixed(2)} €.` : "";
        return { ok: false, message: `Stripe refund zlyhal: ${(err as Error).message}.${done}`, refundedCents };
      }
    } else if (!isDemoPayments) {
      return { ok: false, message: "Platbu nemožno vrátiť automaticky (chýba Stripe platba). Riešte ručne v Stripe.", refundedCents };
    }
    const total = (p.refunded_cents ?? 0) + take;
    const upd = await db
      .from("payments")
      .update({ status: total >= p.amount_cents ? "refunded" : "partially_refunded", refunded_cents: total })
      .eq("id", p.id);
    if (upd.error) {
      return { ok: false, message: `Refund prebehol, no platbu sa nepodarilo uložiť: ${upd.error.message}`, refundedCents: refundedCents + take };
    }
    refundedCents += take;
    left -= take;
  }
  if (amountCents != null && left > 0) {
    return { ok: false, message: `Na vrátenie zostáva už len ${(refundedCents / 100).toFixed(2)} €.`, refundedCents };
  }
  return { ok: true, refundedCents };
}

// orders.payment_status after a refund: refunded once nothing is left, else partially refunded.
export async function syncOrderPaymentStatus(db: SupabaseClient, orderId: string): Promise<void> {
  const { data, error } = await db.from("payments").select("status, amount_cents, refunded_cents").eq("order_id", orderId);
  if (error) throw new Error(`Order ${orderId}: payments load failed: ${error.message}`);
  const charged = (data ?? []).filter((p) => [...REFUNDABLE, "refunded"].includes(p.status));
  const paid = charged.reduce((s, p) => s + p.amount_cents, 0);
  const refunded = charged.reduce((s, p) => s + (p.refunded_cents ?? 0), 0);
  if (refunded === 0) return;
  const upd = await db
    .from("orders")
    .update({ payment_status: refunded >= paid ? "refunded" : "partially_refunded" })
    .eq("id", orderId);
  if (upd.error) throw new Error(`Order ${orderId}: payment status update failed: ${upd.error.message}`);
}
