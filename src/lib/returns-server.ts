import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShopSettings } from "./catalog";
import type { OrderStatus } from "./order-state";
import type { ExistingReturn, OrderLine, ReturnChannel, ReturnItem, ReturnStatus } from "./returns";

// Withdrawal reads and the insert, with the service role after the caller's own access check (order number +
// e-mail, the order's secret token, or requireAdmin()). Customer-facing reads select safe columns only.

export interface WithdrawalOrder {
  id: string;
  orderNumber: string;
  accessToken: string;
  profileId: string | null;
  email: string;
  customerType: "person" | "company";
  status: OrderStatus;
  createdAt: string;
  deliveredAt: string | null;
  withdrawalDeadline: string | null;
  billingName: string;
  lines: OrderLine[];
  returns: ExistingReturn[];
}

const SELECT = `id, order_number, access_token, profile_id, email, customer_type, status, created_at, delivered_at,
  withdrawal_deadline, billing, items:order_items(id, name, sku, quantity, line_gross_cents), returns(status, items)`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function toWithdrawalOrder(o: any): WithdrawalOrder {
  return {
    id: o.id,
    orderNumber: o.order_number,
    accessToken: o.access_token,
    profileId: o.profile_id,
    email: o.email,
    customerType: o.customer_type,
    status: o.status,
    createdAt: o.created_at,
    deliveredAt: o.delivered_at,
    withdrawalDeadline: o.withdrawal_deadline,
    billingName: o.billing?.name ?? "",
    lines: (o.items ?? []).map((i: any) => ({
      id: i.id,
      name: i.name,
      sku: i.sku,
      quantity: i.quantity,
      lineGrossCents: i.line_gross_cents,
    })),
    returns: (o.returns ?? []).map((r: any) => ({ status: r.status as ReturnStatus, items: r.items as ReturnItem[] | null })),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// "obj26-00013 " → "OBJ26-00013"
export const normalizeOrderNumber = (v: string) => v.trim().toUpperCase().replace(/\s+/g, "");

// The public form's check: order number and the order's e-mail must both match. The name is recorded as the
// consumer typed it but is not a gate (a typo or a diacritics difference must not block a legal right).
export async function findOrderForWithdrawal(
  db: SupabaseClient,
  orderNumber: string,
  email: string,
): Promise<WithdrawalOrder | null> {
  const { data, error } = await db.from("orders").select(SELECT).eq("order_number", normalizeOrderNumber(orderNumber)).maybeSingle();
  if (error) throw new Error(`Withdrawal lookup failed: ${error.message}`);
  if (!data || data.email.trim().toLowerCase() !== email.trim().toLowerCase()) return null;
  return toWithdrawalOrder(data);
}

export async function findOrderById(db: SupabaseClient, id: string): Promise<WithdrawalOrder | null> {
  const { data, error } = await db.from("orders").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`Order ${id}: load failed: ${error.message}`);
  return data ? toWithdrawalOrder(data) : null;
}

// Prefill from the order's secret link (guest order page, portal): name and e-mail of that order.
export async function prefillFromToken(
  db: SupabaseClient,
  orderNumber: string,
  token: string,
): Promise<{ orderNumber: string; name: string; email: string } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data } = await db
    .from("orders")
    .select("order_number, email, billing")
    .eq("order_number", normalizeOrderNumber(orderNumber))
    .eq("access_token", token)
    .maybeSingle();
  return data ? { orderNumber: data.order_number, name: data.billing?.name ?? "", email: data.email } : null;
}

export function sellerOf(s: ShopSettings) {
  const address = [s.street, [s.zip, s.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return { name: s.companyName, address, email: s.email };
}

export type CreateReturnResult =
  | { ok: true; returnNumber: string; accessToken: string }
  | { ok: false; reason: "already_withdrawn" | "bad_items" | "order_not_found" };

export async function createReturn(
  db: SupabaseClient,
  r: {
    orderId: string;
    name: string;
    email: string;
    items: ReturnItem[] | null;
    reason: string | null;
    channel: ReturnChannel;
    noticeText: string;
    submittedAt: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdBy?: string | null;
  },
): Promise<CreateReturnResult> {
  const { data, error } = await db.rpc("create_return", {
    p_order_id: r.orderId,
    p_name: r.name,
    p_email: r.email,
    p_items: r.items,
    p_reason: r.reason ?? "",
    p_channel: r.channel,
    p_notice_text: r.noticeText,
    p_submitted_at: r.submittedAt,
    p_ip_address: r.ipAddress ?? null,
    p_user_agent: r.userAgent ?? null,
    p_created_by: r.createdBy ?? null,
  });
  if (error) {
    const known = (["already_withdrawn", "bad_items", "order_not_found"] as const).find((k) => error.message.includes(k));
    if (known) return { ok: false, reason: known };
    throw new Error(`Withdrawal insert failed: ${error.message}`);
  }
  return { ok: true, returnNumber: data.return_number, accessToken: data.access_token };
}

// Confirmation page (/odstupenie-od-zmluvy/potvrdenie/<number>?t=<token>).
export interface ReturnConfirmation {
  returnNumber: string;
  orderNumber: string;
  name: string;
  email: string;
  status: ReturnStatus;
  submittedAt: string;
  noticeText: string;
}

export async function getReturnConfirmation(
  db: SupabaseClient,
  returnNumber: string,
  token: string,
): Promise<ReturnConfirmation | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data, error } = await db
    .from("returns")
    .select("return_number, name, email, status, submitted_at, notice_text, order:orders(order_number)")
    .eq("return_number", returnNumber)
    .eq("access_token", token)
    .maybeSingle();
  if (error) throw new Error(`Return ${returnNumber}: load failed: ${error.message}`);
  if (!data) return null;
  const order = data.order as unknown as { order_number: string } | null;
  return {
    returnNumber: data.return_number,
    orderNumber: order?.order_number ?? "",
    name: data.name,
    email: data.email,
    status: data.status,
    submittedAt: data.submitted_at,
    noticeText: data.notice_text ?? "",
  };
}
