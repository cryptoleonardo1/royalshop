import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus, ShippingMethod } from "@/lib/order-state";
import { RETURN_DONE, suggestedRefundCents, type OrderLine, type ReturnChannel, type ReturnItem, type ReturnStatus } from "@/lib/returns";
import { requireAdmin } from "./auth";

// Admin withdrawal reads, as the signed-in admin (RLS "admin all"), like orders-data.ts.

export interface ReturnRow {
  id: string;
  number: string;
  orderNumber: string;
  name: string;
  email: string;
  channel: ReturnChannel;
  status: ReturnStatus;
  wholeOrder: boolean;
  submittedAt: string;
  refundDeadline: string;
  refundDaysLeft: number; // calendar days to the refund deadline, negative when missed
  refundCents: number | null;
  refundedAt: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const toRow = (r: any, now = new Date()): ReturnRow => ({
  id: r.id,
  number: r.return_number,
  orderNumber: r.order?.order_number ?? "",
  name: r.name,
  email: r.email,
  channel: r.channel,
  status: r.status,
  wholeOrder: r.items == null,
  submittedAt: r.submitted_at,
  refundDeadline: r.refund_deadline,
  refundDaysLeft: Math.ceil((new Date(r.refund_deadline).getTime() - now.getTime()) / 86_400_000),
  refundCents: r.refund_cents,
  refundedAt: r.refunded_at,
});

const LIST_SELECT = `id, return_number, name, email, channel, status, items, submitted_at, refund_deadline, refund_cents,
  refunded_at, order:orders(order_number)`;

export async function listReturns(filter: "open" | "done" | "" = ""): Promise<ReturnRow[]> {
  await requireAdmin();
  const db = await createClient();
  let query = db.from("returns").select(LIST_SELECT).order("submitted_at", { ascending: false }).limit(500);
  if (filter === "open") query = query.not("status", "in", `(${RETURN_DONE.join(",")})`);
  if (filter === "done") query = query.in("status", RETURN_DONE);
  const { data, error } = await query;
  if (error) throw new Error(`Returns: ${error.message}`);
  const now = new Date();
  return (data ?? []).map((r) => toRow(r, now));
}

export async function getReturnDetail(number: string) {
  await requireAdmin();
  const db = await createClient();
  const { data: r, error } = await db
    .from("returns")
    .select(
      `*, order:orders(id, order_number, status, shipping_method, customer_type, email, billing, total_gross_cents,
         shipping_price_cents, delivered_at, created_at,
         items:order_items(id, name, sku, quantity, line_gross_cents),
         payments(status, amount_cents, refunded_cents))`,
    )
    .eq("return_number", number)
    .maybeSingle();
  if (error) throw new Error(`Return ${number}: ${error.message}`);
  if (!r) return null;

  const o = r.order as any;
  const lines: OrderLine[] = (o.items ?? []).map((i: any) => ({
    id: i.id,
    name: i.name,
    sku: i.sku,
    quantity: i.quantity,
    lineGrossCents: i.line_gross_cents,
  }));
  const items = r.items as ReturnItem[] | null;
  const refundable = (o.payments ?? [])
    .filter((p: any) => ["captured", "partially_refunded"].includes(p.status))
    .reduce((s: number, p: any) => s + p.amount_cents - (p.refunded_cents ?? 0), 0);
  const withdrawn = items == null ? lines : lines.filter((l) => items.some((i) => i.order_item_id === l.id));

  const people = [r.created_by].filter(Boolean);
  const { data: authors } = people.length
    ? await db.from("profiles").select("id, email, first_name, last_name").in("id", people)
    : { data: [] };
  const author = authors?.[0];

  return {
    ret: r,
    row: toRow(r),
    order: {
      id: o.id as string,
      number: o.order_number as string,
      status: o.status as OrderStatus,
      shippingMethod: o.shipping_method as ShippingMethod,
      customerType: o.customer_type as "person" | "company",
      totalGrossCents: o.total_gross_cents as number,
      shippingPriceCents: o.shipping_price_cents as number,
      deliveredAt: o.delivered_at as string | null,
    },
    lines,
    withdrawn,
    refundableCents: refundable,
    suggestedCents: suggestedRefundCents({ items, lines, orderTotalCents: o.total_gross_cents, refundableCents: refundable }),
    createdByName: author ? [author.first_name, author.last_name].filter(Boolean).join(" ") || author.email : null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Dashboard: open withdrawals and the ones whose 14-day refund deadline is close or missed.
export async function returnsDashboard() {
  const open = await listReturns("open");
  return { open, refundDue: open.filter((r) => r.refundDaysLeft <= 3) };
}
