import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus, ShippingMethod } from "./order-state";
import type { ReturnStatus } from "./returns";

// One order as the customer sees it: the guest page (/objednavka/<number>?t=<token>) and the account
// portal (/ucet/objednavky/<number>) both load it here with the service role, after their own access
// check. Only customer-safe columns: no admin_note, purchase prices or internal history notes.

export const ORDER_DETAIL_SELECT = `
  id, order_number, access_token, profile_id, status, payment_status, customer_type, email, phone, billing,
  shipping_address, company, shipping_method, shipping_price_cents, subtotal_gross_cents, total_net_cents,
  total_vat_cents, total_gross_cents, estimated_delivery_date, delivered_at, withdrawal_deadline, created_at,
  items:order_items(name, sku, quantity, unit_price_gross_cents, line_gross_cents),
  returns(return_number, status, items, submitted_at, access_token, refund_cents, refunded_at),
  history:order_status_history(to_status, created_at),
  shipments(carrier, tracking_number, tracking_url, shipped_at)
`;

export interface OrderAddress {
  name: string;
  contact?: string;
  street: string;
  city: string;
  zip: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  accessToken: string;
  profileId: string | null;
  status: OrderStatus;
  customerType: "person" | "company";
  email: string;
  phone: string | null;
  billing: OrderAddress;
  shippingAddress: OrderAddress | null;
  company: { name: string; ico: string; dic: string; ic_dph: string | null } | null;
  shippingMethod: ShippingMethod;
  shippingPriceCents: number;
  totalVatCents: number;
  totalGrossCents: number;
  estimatedDeliveryDate: string | null;
  deliveredAt: string | null;
  withdrawalDeadline: string | null;
  createdAt: string;
  items: { name: string; sku: string | null; quantity: number; lineGrossCents: number }[];
  // latest time the order reached each status
  reachedAt: Partial<Record<OrderStatus, string>>;
  shipments: { carrier: string; trackingNumber: string | null; trackingUrl: string | null }[];
  // withdrawals filed for this order; accessToken opens its confirmation page
  returns: {
    returnNumber: string;
    status: ReturnStatus;
    wholeOrder: boolean;
    submittedAt: string;
    accessToken: string;
    refundCents: number | null;
    refundedAt: string | null;
  }[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function toOrderDetail(r: any): OrderDetail {
  const reachedAt: Partial<Record<OrderStatus, string>> = {};
  for (const h of r.history ?? []) {
    const s = h.to_status as OrderStatus;
    if (!reachedAt[s] || reachedAt[s]! < h.created_at) reachedAt[s] = h.created_at;
  }
  return {
    id: r.id,
    orderNumber: r.order_number,
    accessToken: r.access_token,
    profileId: r.profile_id,
    status: r.status,
    customerType: r.customer_type,
    email: r.email,
    phone: r.phone,
    billing: r.billing,
    shippingAddress: r.shipping_address,
    company: r.company,
    shippingMethod: r.shipping_method,
    shippingPriceCents: r.shipping_price_cents,
    totalVatCents: r.total_vat_cents,
    totalGrossCents: r.total_gross_cents,
    estimatedDeliveryDate: r.estimated_delivery_date,
    deliveredAt: r.delivered_at,
    withdrawalDeadline: r.withdrawal_deadline,
    createdAt: r.created_at,
    items: (r.items ?? []).map((i: any) => ({
      name: i.name,
      sku: i.sku,
      quantity: i.quantity,
      lineGrossCents: i.line_gross_cents,
    })),
    reachedAt,
    shipments: [...(r.shipments ?? [])]
      .sort((a: any, b: any) => (a.shipped_at < b.shipped_at ? 1 : -1))
      .map((s: any) => ({ carrier: s.carrier, trackingNumber: s.tracking_number, trackingUrl: s.tracking_url })),
    returns: [...(r.returns ?? [])]
      .sort((a: any, b: any) => (a.submitted_at < b.submitted_at ? -1 : 1))
      .map((x: any) => ({
        returnNumber: x.return_number,
        status: x.status,
        wholeOrder: x.items == null,
        submittedAt: x.submitted_at,
        accessToken: x.access_token,
        refundCents: x.refund_cents,
        refundedAt: x.refunded_at,
      })),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function loadOrderDetail(
  db: SupabaseClient,
  orderNumber: string,
  access: { token: string } | { profileId: string },
): Promise<OrderDetail | null> {
  let query = db.from("orders").select(ORDER_DETAIL_SELECT).eq("order_number", orderNumber);
  query = "token" in access ? query.eq("access_token", access.token) : query.eq("profile_id", access.profileId);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`Order ${orderNumber}: load failed: ${error.message}`);
  return data ? toOrderDetail(data) : null;
}
