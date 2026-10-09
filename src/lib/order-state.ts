// Order lifecycle. The only place that decides which status may follow which.
// See docs/04-technicka-dokumentacia.md §4.2.

export const ORDER_STATUSES = [
  "pending_payment",
  "paid_authorized",
  "confirmed",
  "ordered_from_supplier",
  "received_at_branch",
  "tested",
  "shipped",
  "out_for_delivery",
  "ready_for_pickup",
  "delivered",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type ShippingMethod = "courier" | "own_transport" | "pickup_senec";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Čaká na platbu",
  paid_authorized: "Platba autorizovaná",
  confirmed: "Potvrdená",
  ordered_from_supplier: "Objednané u dodávateľa",
  received_at_branch: "Prijaté na pobočke",
  tested: "Otestované a zabalené",
  shipped: "Odoslané kuriérom",
  out_for_delivery: "Na ceste (náš rozvoz)",
  ready_for_pickup: "Pripravené na odber",
  delivered: "Doručené",
  completed: "Vybavené",
  cancelled: "Zrušené",
};

const DISPATCH_BY_METHOD: Record<ShippingMethod, OrderStatus> = {
  courier: "shipped",
  own_transport: "out_for_delivery",
  pickup_senec: "ready_for_pickup",
};

export function dispatchStatus(method: ShippingMethod): OrderStatus {
  return DISPATCH_BY_METHOD[method];
}

export function allowedNextStatuses(current: OrderStatus, method: ShippingMethod): OrderStatus[] {
  switch (current) {
    case "pending_payment":
      return ["paid_authorized", "cancelled"];
    case "paid_authorized":
      return ["confirmed", "cancelled"];
    case "confirmed":
      return ["ordered_from_supplier", "cancelled"];
    case "ordered_from_supplier":
      return ["received_at_branch", "cancelled"];
    case "received_at_branch":
      return ["tested"];
    case "tested":
      return [dispatchStatus(method)];
    case "shipped":
    case "out_for_delivery":
    case "ready_for_pickup":
      return ["delivered"];
    case "delivered":
      return ["completed"];
    case "completed":
    case "cancelled":
      return [];
  }
}

export function canTransition(from: OrderStatus, to: OrderStatus, method: ShippingMethod): boolean {
  return allowedNextStatuses(from, method).includes(to);
}

// Customer-facing timeline (what the portal shows as steps).
export function timelineFor(method: ShippingMethod): OrderStatus[] {
  return ["paid_authorized", "confirmed", "ordered_from_supplier", "received_at_branch", "tested", dispatchStatus(method), "delivered"];
}

export const WITHDRAWAL_DAYS = 14;

// Consumers only (founder decision: companies get no withdrawal option).
export function withdrawalDeadline(deliveredAt: Date): Date {
  const d = new Date(deliveredAt);
  d.setDate(d.getDate() + WITHDRAWAL_DAYS);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function canWithdraw(
  order: { customer_type: "person" | "company"; status: OrderStatus; delivered_at: string | null },
  now = new Date(),
): boolean {
  if (order.customer_type !== "person") return false;
  if (!order.delivered_at || !["delivered", "completed"].includes(order.status)) return false;
  return now <= withdrawalDeadline(new Date(order.delivered_at));
}
