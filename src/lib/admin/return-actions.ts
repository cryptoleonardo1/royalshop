"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopSettings } from "@/lib/catalog";
import { eurToCents, formatEur } from "@/lib/money";
import { canTransition, type OrderStatus, type ShippingMethod } from "@/lib/order-state";
import { transitionOrder } from "@/lib/orders";
import {
  allowedReturnSteps,
  canRefund,
  RETURN_STATUS_LABELS,
  remainingLines,
  suggestedRefundCents,
  toReturnItems,
  withdrawalNotice,
  type OrderLine,
  type ReturnItem,
  type ReturnStatus,
} from "@/lib/returns";
import { createReturn, findOrderById, sellerOf } from "@/lib/returns-server";
import { bratislavaMidnight } from "@/lib/sk-calendar";
import { withdrawalEligibility } from "@/lib/withdrawal";
import { requireAdmin } from "./auth";
import { refundCaptured, refundableCents, syncOrderPaymentStatus } from "./refunds";

// Admin withdrawal writes. Each action authorizes itself, then writes with the service role. Status changes
// use an optimistic lock on the current status; money moves only in refundReturn.

export type ReturnActionState = { ok?: boolean; message?: string } | undefined;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const STALE = "Odstúpenie medzitým zmenil niekto iný. Obnovte stránku.";

interface LoadedReturn {
  id: string;
  return_number: string;
  status: ReturnStatus;
  items: ReturnItem[] | null;
  order_id: string;
}

async function loadReturn(db: ReturnType<typeof createAdminClient>, id: string): Promise<LoadedReturn | null> {
  const { data, error } = await db.from("returns").select("id, return_number, status, items, order_id").eq("id", id).maybeSingle();
  if (error) throw new Error(`Return ${id}: load failed: ${error.message}`);
  return data as LoadedReturn | null;
}

export async function advanceReturn(_prev: ReturnActionState, form: FormData): Promise<ReturnActionState> {
  await requireAdmin();
  const db = createAdminClient();
  const ret = await loadReturn(db, text(form, "returnId"));
  if (!ret) return { message: "Odstúpenie neexistuje." };
  if (text(form, "from") !== ret.status) return { message: STALE };
  const to = text(form, "to") as ReturnStatus;
  if (!allowedReturnSteps(ret.status).includes(to)) {
    return { message: `Z „${RETURN_STATUS_LABELS[ret.status]}“ sa nedá prejsť na „${RETURN_STATUS_LABELS[to] ?? to}“.` };
  }
  const patch: Record<string, unknown> = { status: to };
  if (to === "goods_received") patch.goods_received_at = new Date().toISOString();
  if (to === "rejected") {
    const reason = text(form, "reason");
    if (!reason) return { message: "Uveďte dôvod zamietnutia (zákazníkovi ho treba písomne oznámiť)." };
    patch.refund_reason = reason;
  }
  const { data, error } = await db.from("returns").update(patch).eq("id", ret.id).eq("status", ret.status).select("id").maybeSingle();
  if (error) return { message: `Uloženie zlyhalo: ${error.message}` };
  if (!data) return { message: STALE };
  refresh();
  return { ok: true };
}

// Refund via Stripe. The full suggested amount → "refunded"; less needs a written reason → "refunded_partially".
// A diminished value of the goods must NOT be deducted here (§ 22 ods. 8 ZOS bans unilateral set-off): refund
// in full and claim the damage separately.
export async function refundReturn(_prev: ReturnActionState, form: FormData): Promise<ReturnActionState> {
  const admin = await requireAdmin();
  const db = createAdminClient();
  const ret = await loadReturn(db, text(form, "returnId"));
  if (!ret) return { message: "Odstúpenie neexistuje." };
  if (text(form, "from") !== ret.status) return { message: STALE };
  if (!canRefund(ret.status)) return { message: "Toto odstúpenie je už vybavené." };
  if (form.get("confirm") !== "on") return { message: "Potvrďte vrátenie peňazí." };

  const { data: order, error } = await db
    .from("orders")
    .select("id, order_number, status, shipping_method, total_gross_cents, items:order_items(id, name, sku, quantity, line_gross_cents)")
    .eq("id", ret.order_id)
    .single();
  if (error) return { message: `Objednávku sa nepodarilo načítať: ${error.message}` };
  const lines: OrderLine[] = (order.items ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    sku: i.sku,
    quantity: i.quantity,
    lineGrossCents: i.line_gross_cents,
  }));
  const refundable = await refundableCents(db, order.id);
  if (refundable === 0) {
    // e.g. the order was already cancelled and refunded in full: nothing left to send, just close it
    const { data: closed, error: closeErr } = await db
      .from("returns")
      .update({
        status: "refunded",
        refund_cents: 0,
        refund_reason: text(form, "reason") || "Platba už bola vrátená skôr (napríklad pri zrušení objednávky).",
        refunded_at: new Date().toISOString(),
      })
      .eq("id", ret.id)
      .eq("status", ret.status)
      .select("id")
      .maybeSingle();
    if (closeErr) return { message: `Uloženie zlyhalo: ${closeErr.message}` };
    if (!closed) return { message: STALE };
    refresh();
    return { ok: true, message: "Na objednávke už nebolo čo vrátiť, odstúpenie je uzavreté." };
  }
  const amountEur = Number(text(form, "amount").replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(amountEur) || amountEur <= 0) return { message: "Zadajte sumu na vrátenie." };
  const amount = eurToCents(amountEur);
  if (amount > refundable) return { message: `Vrátiť sa dá najviac ${formatEur(refundable)}.` };
  const suggested = suggestedRefundCents({ items: ret.items, lines, orderTotalCents: order.total_gross_cents, refundableCents: refundable });
  const reason = text(form, "reason");
  const partial = amount < suggested;
  if (partial && !reason) return { message: `Suma je nižšia ako ${formatEur(suggested)}. Uveďte písomné zdôvodnenie.` };

  const refund = await refundCaptured(db, order, amount, {
    keyPrefix: `return-${ret.id}`,
    metadata: { return_number: ret.return_number, refunded_by: admin.email },
  });
  if (!refund.ok) {
    if (refund.refundedCents > 0) await syncOrderPaymentStatus(db, order.id);
    return { message: refund.message };
  }

  const { error: upd } = await db
    .from("returns")
    .update({
      status: partial ? "refunded_partially" : "refunded",
      refund_cents: refund.refundedCents,
      refund_reason: reason || null,
      refunded_at: new Date().toISOString(),
    })
    .eq("id", ret.id);
  if (upd) return { message: `Peniaze sú vrátené, no odstúpenie sa nepodarilo uložiť: ${upd.message}` };
  await syncOrderPaymentStatus(db, order.id);

  // A whole-order withdrawal before the goods arrived also ends the order (cancel is allowed only that early).
  const status = order.status as OrderStatus;
  if (ret.items == null && canTransition(status, "cancelled", order.shipping_method as ShippingMethod)) {
    await transitionOrder(db, { id: order.id, status, shipping_method: order.shipping_method as ShippingMethod }, "cancelled", {
      note: `Odstúpenie ${ret.return_number}: vrátené ${formatEur(refund.refundedCents)}`,
      changedBy: admin.id,
    });
  }
  refresh();
  return { ok: true, message: `Vrátené ${formatEur(refund.refundedCents)}.` };
}

export async function saveReturnNote(_prev: ReturnActionState, form: FormData): Promise<ReturnActionState> {
  await requireAdmin();
  const { error } = await createAdminClient()
    .from("returns")
    .update({ admin_note: text(form, "adminNote") || null })
    .eq("id", text(form, "returnId"));
  if (error) return { message: `Poznámku sa nepodarilo uložiť: ${error.message}` };
  refresh();
  return { ok: true, message: "Uložené." };
}

// <input type="datetime-local"> in Bratislava time → UTC instant.
function bratislavaDateTime(raw: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(raw);
  if (!m) return null;
  const midnight = bratislavaMidnight({ y: +m[1], m: +m[2], d: +m[3] });
  return new Date(midnight.getTime() + (+m[4] * 60 + +m[5]) * 60_000);
}

// A withdrawal that arrived by e-mail or letter. "Odoslané" is when the consumer sent it (e-mail time,
// postmark): that decides whether it was in time (§ 20 ods. 7 ZOS) and starts our 14 days to refund.
export async function createManualReturn(_prev: ReturnActionState, form: FormData): Promise<ReturnActionState> {
  const admin = await requireAdmin();
  const db = createAdminClient();
  const order = await findOrderById(db, text(form, "orderId"));
  if (!order) return { message: "Objednávka neexistuje." };

  const sent = bratislavaDateTime(text(form, "submittedAt"));
  if (!sent) return { message: "Zadajte dátum a čas odoslania." };
  if (sent.getTime() > Date.now()) return { message: "Dátum odoslania nemôže byť v budúcnosti." };
  if (sent.getTime() < new Date(order.createdAt).getTime()) return { message: "Odstúpenie nemôže byť staršie ako objednávka." };
  const name = text(form, "name");
  const email = text(form, "email").toLowerCase();
  if (!name || !email) return { message: "Zadajte meno a e-mail zákazníka." };

  const eligibility = withdrawalEligibility(
    {
      customer_type: order.customerType,
      status: order.status,
      delivered_at: order.deliveredAt,
      withdrawal_deadline: order.withdrawalDeadline,
    },
    sent,
  );
  if (!eligibility.allowed) {
    const why: Record<string, string> = {
      company: "Objednávka je na firmu, zákonné odstúpenie sa nevzťahuje.",
      unpaid: "Objednávka nie je zaplatená, zmluva nevznikla.",
      cancelled: "Objednávka je zrušená.",
      expired: "Odstúpenie bolo odoslané po lehote. Nezapisuje sa, zákazníkovi odpíšte, že lehota uplynula.",
    };
    return { message: why[eligibility.block!] };
  }

  const open = remainingLines(order.lines, order.returns);
  const picked = new Set(form.getAll("item").map(String));
  const selected = open.filter((l) => picked.has(l.id));
  if (selected.length === 0) return { message: "Vyberte aspoň jednu položku." };
  const earlier = order.returns.some((r) => r.status !== "rejected");
  const items = toReturnItems(selected, order.lines, earlier);
  const reason = text(form, "reason") || null;
  const submittedAt = sent.toISOString();

  const result = await createReturn(db, {
    orderId: order.id,
    name,
    email,
    items,
    reason,
    channel: "manual",
    noticeText: withdrawalNotice({
      seller: sellerOf(await getShopSettings()),
      orderNumber: order.orderNumber,
      orderedAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      lines: selected,
      wholeOrder: items == null,
      name,
      email,
      reason,
      submittedAt,
      channel: "manual",
    }),
    submittedAt,
    createdBy: admin.id,
  });
  if (!result.ok) {
    return { message: result.reason === "already_withdrawn" ? "Od týchto položiek už zákazník odstúpil." : "Odstúpenie sa nepodarilo uložiť." };
  }
  const source = text(form, "source");
  if (source) {
    await db.from("returns").update({ admin_note: `Prijaté: ${source}` }).eq("return_number", result.returnNumber);
  }
  // straight to the new withdrawal: the order page's entry form disappears once nothing is left to withdraw
  redirect(`/admin/odstupenia/${encodeURIComponent(result.returnNumber)}`);
}
