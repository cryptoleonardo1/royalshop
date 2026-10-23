import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DELIVERY_MAX_WORKDAYS } from "@/lib/legal";
import type { OrderStatus, ShippingMethod } from "@/lib/order-state";
import { addWorkingDays, endOfBratislavaDay } from "@/lib/sk-calendar";
import { withdrawalInfo, type WithdrawalInfo, type WithdrawalWindow } from "@/lib/withdrawal";
import { requireAdmin } from "./auth";

// Admin reads run as the signed-in admin (RLS "admin all"), so a bug here can never leak data to anyone else.

export interface OrderRow {
  id: string;
  number: string;
  createdAt: string;
  customer: string;
  email: string;
  customerType: "person" | "company";
  status: OrderStatus;
  paymentStatus: string;
  shippingMethod: ShippingMethod;
  totalGrossCents: number;
  marginNetCents: number | null; // null when a purchase price is missing
  paidAt: string | null;
  deliveryLimit: Date | null; // binding "najneskôr do 10 pracovných dní od zaplatenia"
  deliveredAt: string | null;
  withdrawal: WithdrawalInfo;
}

export interface OrderFilters {
  q?: string;
  status?: string; // a status, or "active" (paid and not finished)
  window?: WithdrawalWindow | "";
}

export const ACTIVE_STATUSES: OrderStatus[] = [
  "paid",
  "confirmed",
  "ordered_from_supplier",
  "received_at_branch",
  "tested",
  "shipped",
  "out_for_delivery",
  "ready_for_pickup",
];

const LIST_LIMIT = 500;

/* eslint-disable @typescript-eslint/no-explicit-any */
function toRow(o: any, now: Date): OrderRow {
  const captured = (o.payments ?? [])
    .map((p: any) => p.captured_at ?? p.authorized_at)
    .filter(Boolean)
    .sort()[0] as string | undefined;
  const items = (o.items ?? []) as { quantity: number; line_net_cents: number; purchase_price_net_cents: number | null }[];
  const margin = items.every((i) => i.purchase_price_net_cents != null)
    ? items.reduce((s, i) => s + i.line_net_cents - (i.purchase_price_net_cents ?? 0) * i.quantity, 0)
    : null;
  const status = o.status as OrderStatus;
  const finished = ["delivered", "completed", "cancelled"].includes(status);
  return {
    id: o.id,
    number: o.order_number,
    createdAt: o.created_at,
    customer: o.company?.name ?? o.billing?.name ?? o.email,
    email: o.email,
    customerType: o.customer_type,
    status,
    paymentStatus: o.payment_status,
    shippingMethod: o.shipping_method,
    totalGrossCents: o.total_gross_cents,
    marginNetCents: margin,
    paidAt: captured ?? null,
    deliveryLimit: captured && !finished ? endOfBratislavaDay(addWorkingDays(new Date(captured), DELIVERY_MAX_WORKDAYS)) : null,
    deliveredAt: o.delivered_at,
    withdrawal: withdrawalInfo(
      {
        customer_type: o.customer_type,
        status,
        delivered_at: o.delivered_at,
        withdrawal_deadline: o.withdrawal_deadline,
        hasWithdrawal: (o.returns ?? []).some((r: any) => r.status !== "rejected"),
      },
      now,
    ),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const LIST_SELECT = `id, order_number, created_at, email, customer_type, billing, company, status, payment_status,
  shipping_method, total_gross_cents, delivered_at, withdrawal_deadline,
  payments(captured_at, authorized_at), returns(status), items:order_items(quantity, line_net_cents, purchase_price_net_cents)`;

// PostgREST or-filter values must not contain its syntax characters.
const safeSearch = (q: string) => q.replace(/[,()*%\\:"']/g, " ").trim();

export async function listOrders(filters: OrderFilters): Promise<{ rows: OrderRow[]; truncated: boolean }> {
  await requireAdmin();
  const db = await createClient();
  let query = db.from("orders").select(LIST_SELECT).order("created_at", { ascending: false }).limit(LIST_LIMIT + 1);
  if (filters.status === "active") query = query.in("status", ACTIVE_STATUSES);
  else if (filters.status) query = query.eq("status", filters.status);
  const q = safeSearch(filters.q ?? "");
  if (q) {
    query = query.or(
      [`order_number.ilike.*${q}*`, `email.ilike.*${q}*`, `billing->>name.ilike.*${q}*`, `company->>name.ilike.*${q}*`, `company->>ico.ilike.*${q}*`].join(","),
    );
  }
  const { data, error } = await query;
  if (error) throw new Error(`Orders: ${error.message}`);
  const now = new Date();
  let rows = (data ?? []).slice(0, LIST_LIMIT).map((o) => toRow(o, now));
  if (filters.window) rows = rows.filter((r) => r.withdrawal.window === filters.window);
  return { rows, truncated: (data ?? []).length > LIST_LIMIT };
}

export interface DashboardStats {
  unconfirmed: OrderRow[]; // paid, waiting for our confirmation
  unconfirmedOverdue: number; // paid more than 1 working day ago (docs/06: confirm within 1 working day)
  deliveryAtRisk: OrderRow[]; // binding delivery limit within 2 working days or missed
  withdrawalOpen: OrderRow[];
  withdrawalGrace: OrderRow[];
  beforeDelivery: number;
  monthRevenueCents: number;
  monthMarginCents: number;
  monthOrders: number;
  byStatus: Partial<Record<OrderStatus, number>>;
}

export async function dashboardStats(): Promise<DashboardStats> {
  const { rows } = await listOrders({});
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const riskLine = endOfBratislavaDay(addWorkingDays(now, 2));
  const live = rows.filter((r) => r.paidAt && r.status !== "cancelled");
  const month = live.filter((r) => new Date(r.paidAt!) >= monthStart && r.paymentStatus === "paid");
  const byStatus: Partial<Record<OrderStatus, number>> = {};
  rows.forEach((r) => (byStatus[r.status] = (byStatus[r.status] ?? 0) + 1));
  const unconfirmed = rows.filter((r) => r.status === "paid");
  return {
    unconfirmed,
    unconfirmedOverdue: unconfirmed.filter((r) => r.paidAt && endOfBratislavaDay(addWorkingDays(new Date(r.paidAt), 1)) < now)
      .length,
    deliveryAtRisk: rows.filter((r) => r.deliveryLimit && r.deliveryLimit <= riskLine),
    withdrawalOpen: rows.filter((r) => r.withdrawal.window === "open"),
    withdrawalGrace: rows.filter((r) => r.withdrawal.window === "grace"),
    beforeDelivery: rows.filter((r) => r.withdrawal.window === "before_delivery").length,
    monthRevenueCents: month.reduce((s, r) => s + r.totalGrossCents, 0),
    monthMarginCents: month.reduce((s, r) => s + (r.marginNetCents ?? 0), 0),
    monthOrders: month.length,
    byStatus,
  };
}

export async function getOrderDetail(number: string) {
  await requireAdmin();
  const db = await createClient();
  const { data: o, error } = await db
    .from("orders")
    .select(
      `*, items:order_items(id, name, sku, quantity, unit_price_gross_cents, vat_rate, line_net_cents, line_gross_cents,
         purchase_price_net_cents, serial_number, supplier:suppliers(name)),
       history:order_status_history(id, from_status, to_status, changed_by, note, created_at),
       payments(id, provider, status, amount_cents, refunded_cents, captured_at, authorized_at, stripe_payment_intent_id, stripe_checkout_session_id, created_at),
       shipments(carrier, tracking_number, tracking_url, shipped_at, delivered_at),
       supplier_orders(reference, ordered_at, expected_at, received_at, supplier:suppliers(name)),
       returns(return_number, status, submitted_at),
       invoices(invoice_number, type, status, issue_date, total_gross_cents)`,
    )
    .eq("order_number", number)
    .maybeSingle();
  if (error) throw new Error(`Order ${number}: ${error.message}`);
  if (!o) return null;

  const authorIds = [...new Set((o.history ?? []).map((h: { changed_by: string | null }) => h.changed_by).filter(Boolean))];
  const { data: authors } = authorIds.length
    ? await db.from("profiles").select("id, email, first_name, last_name").in("id", authorIds)
    : { data: [] };
  const authorName = new Map(
    (authors ?? []).map((a) => [a.id, [a.first_name, a.last_name].filter(Boolean).join(" ") || a.email]),
  );
  const row = toRow(o, new Date());
  return { order: o, row, authorName };
}
