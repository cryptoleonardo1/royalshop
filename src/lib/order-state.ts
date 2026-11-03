// Order lifecycle. The only place that decides which status may follow which.
// See docs/04-technicka-dokumentacia.md §4.2.

import { withdrawalEligibility } from "./withdrawal";

export { WITHDRAWAL_DAYS, withdrawalDeadline } from "./withdrawal";

export const ORDER_STATUSES = [
  "reserved",
  "pending_payment",
  "paid",
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
// Where the purchase contract was concluded. A sale signed and paid in our shop is not a distance contract
// (§ 14 ods. 1 ZOS), so it carries no statutory withdrawal.
export type ContractPlace = "distance" | "on_premises";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  reserved: "Rezervácia",
  pending_payment: "Čaká na platbu",
  paid: "Zaplatená",
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
    // non-binding reservation (persons): we call the customer, then either a payment link or a sale in the shop
    case "reserved":
      return ["pending_payment", "paid", "cancelled"];
    case "pending_payment":
      return ["paid", "cancelled"];
    case "paid":
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
  return ["paid", "confirmed", "ordered_from_supplier", "received_at_branch", "tested", dispatchStatus(method), "delivered"];
}

// Consumers only (founder decision: companies get no withdrawal option), also before delivery (§ 20 ods. 5
// ZOS). Deadline rules: withdrawal.ts.
export function canWithdraw(
  order: {
    customer_type: "person" | "company";
    status: OrderStatus;
    delivered_at: string | null;
    contract_place?: ContractPlace;
  },
  now = new Date(),
): boolean {
  return withdrawalEligibility(order, now).allowed;
}
