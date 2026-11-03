// Consumer withdrawal window (odstúpenie, § 19 ZOS) as the admin sees it: the biggest business risk, so
// every order is classified. Pure, safe on server and client. See docs/06-pravne-stranky.md §1.4.

import type { ContractPlace, OrderStatus } from "./order-state";
import { addCalendarDays, bratislavaDay, calendarDaysBetween, endOfBratislavaDay, shiftToWorkingDay } from "./sk-calendar";

export const WITHDRAWAL_DAYS = 14;

// The notice only has to be SENT within the deadline. A letter posted on the last day can arrive a few
// days later, so an order stays "grace" (not yet safe) for this many calendar days after the deadline.
export const WITHDRAWAL_POST_GRACE_DAYS = 5;

// 14 calendar days from delivery (Bratislava day), last day moved to the next working day (§ 122 OZ),
// ending 23:59:59 Bratislava time.
export function withdrawalDeadline(deliveredAt: Date): Date {
  const last = shiftToWorkingDay(addCalendarDays(bratislavaDay(deliveredAt), WITHDRAWAL_DAYS));
  return endOfBratislavaDay(last);
}

export type WithdrawalWindow =
  | "none" // reserved, not paid yet or cancelled: no contract to withdraw from
  | "company" // B2B: no statutory withdrawal
  | "on_premises" // consumer signed and paid in our shop: not a distance contract
  | "before_delivery" // consumer may already withdraw; the 14 days start on delivery
  | "open" // within the 14 days
  | "grace" // deadline passed, a timely posted notice may still arrive
  | "closed" // safe: window over
  | "withdrawn"; // a withdrawal was filed

export const WITHDRAWAL_WINDOW_LABELS: Record<WithdrawalWindow, string> = {
  none: "Nevzťahuje sa",
  company: "Firma (bez odstúpenia)",
  on_premises: "Kúpa na predajni (bez odstúpenia)",
  before_delivery: "Pred doručením",
  open: "Lehota plynie",
  grace: "Po lehote, čaká sa na poštu",
  closed: "Lehota uplynula",
  withdrawn: "Odstúpené",
};

// Filter order in the admin (riskiest first).
export const WITHDRAWAL_WINDOWS: WithdrawalWindow[] = [
  "open",
  "grace",
  "before_delivery",
  "withdrawn",
  "closed",
  "company",
  "on_premises",
  "none",
];

export interface WithdrawalInput {
  customer_type: "person" | "company";
  status: OrderStatus;
  delivered_at: string | null;
  contract_place?: ContractPlace;
  withdrawal_deadline?: string | null;
  hasWithdrawal?: boolean;
  withdrawalPending?: boolean; // a withdrawal is filed and not yet refunded or rejected
}

export interface WithdrawalInfo {
  window: WithdrawalWindow;
  deadline: Date | null;
  daysLeft: number | null; // calendar days to the deadline (0 = last day), only while open
}

export function withdrawalInfo(order: WithdrawalInput, now = new Date()): WithdrawalInfo {
  const none = (window: WithdrawalWindow): WithdrawalInfo => ({ window, deadline: null, daysLeft: null });
  if (order.status === "reserved" || order.status === "pending_payment") return none("none");
  if (order.customer_type !== "person") return none("company");
  if (order.contract_place === "on_premises") return none("on_premises");
  if (order.hasWithdrawal) return none("withdrawn");
  if (order.status === "cancelled") return none("none");
  if (!order.delivered_at) return none("before_delivery");

  const deadline = order.withdrawal_deadline
    ? new Date(order.withdrawal_deadline)
    : withdrawalDeadline(new Date(order.delivered_at));
  if (now <= deadline) return { window: "open", deadline, daysLeft: Math.max(0, calendarDaysBetween(now, deadline)) };
  const graceEnd = new Date(deadline.getTime() + WITHDRAWAL_POST_GRACE_DAYS * 86_400_000);
  return { window: now <= graceEnd ? "grace" : "closed", deadline, daysLeft: null };
}

// An order may be closed as "Vybavené" only once no withdrawal can still reach us and every filed one is
// settled. A partial withdrawal leaves the other items open, so the regular window applies either way.
export function canCompleteOrder(order: WithdrawalInput, now = new Date()): boolean {
  if (order.withdrawalPending) return false;
  const { window } = withdrawalInfo({ ...order, hasWithdrawal: false }, now);
  return window === "closed" || window === "company" || window === "on_premises";
}

// What the customer may do (form, portal): withdraw before delivery (§ 20 ods. 5 ZOS) or until the deadline.
// The admin's post grace period does not extend the customer's deadline.
export type WithdrawalBlock = "unpaid" | "cancelled" | "company" | "on_premises" | "expired";

export interface WithdrawalEligibility {
  allowed: boolean;
  block?: WithdrawalBlock;
  deadline: Date | null;
  daysLeft: number | null;
}

export function withdrawalEligibility(order: WithdrawalInput, now = new Date()): WithdrawalEligibility {
  const info = withdrawalInfo({ ...order, hasWithdrawal: false }, now);
  const { deadline, daysLeft } = info;
  switch (info.window) {
    case "before_delivery":
    case "open":
      return { allowed: true, deadline, daysLeft };
    case "company":
    case "on_premises":
      return { allowed: false, block: info.window, deadline: null, daysLeft: null };
    case "none":
      return { allowed: false, block: order.status === "cancelled" ? "cancelled" : "unpaid", deadline: null, daysLeft: null };
    default:
      return { allowed: false, block: "expired", deadline, daysLeft: null };
  }
}
