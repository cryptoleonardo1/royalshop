// Withdrawals (odstúpenie, `returns` table): statuses, the notice text the consumer sends, which items are
// still open and what to refund. Pure, safe on server and client. Spec: docs/04 §4.3, docs/pravne/B §3 and §6.

import { formatDate, formatDateTime } from "./format";

export const RETURN_STATUSES = [
  "requested",
  "awaiting_goods",
  "goods_received",
  "inspected",
  "refunded",
  "refunded_partially",
  "rejected",
] as const;

export type ReturnStatus = (typeof RETURN_STATUSES)[number];
export type ReturnChannel = "portal" | "public_form" | "manual";

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "Prijaté",
  awaiting_goods: "Čaká sa na tovar",
  goods_received: "Tovar prijatý",
  inspected: "Tovar skontrolovaný",
  refunded: "Vrátené",
  refunded_partially: "Vrátené čiastočne",
  rejected: "Zamietnuté",
};

// What the customer sees in the portal / on the order page.
export const RETURN_STATUS_CUSTOMER: Record<ReturnStatus, string> = {
  requested: "Odstúpenie sme prijali",
  awaiting_goods: "Čakáme na vrátenie tovaru",
  goods_received: "Tovar sme prijali",
  inspected: "Tovar sme skontrolovali, pripravujeme vrátenie peňazí",
  refunded: "Peniaze sme vrátili",
  refunded_partially: "Peniaze sme vrátili čiastočne",
  rejected: "Odstúpenie sme zamietli",
};

export const RETURN_CHANNEL_LABELS: Record<ReturnChannel, string> = {
  portal: "Zákaznícky účet",
  public_form: "Online formulár",
  manual: "Zapísané ručne (e-mail, list)",
};

export const RETURN_DONE: ReturnStatus[] = ["refunded", "refunded_partially", "rejected"];

// Steps the admin may take without moving money; refunds have their own action (refunded*).
export function allowedReturnSteps(current: ReturnStatus): ReturnStatus[] {
  switch (current) {
    case "requested":
      return ["awaiting_goods", "goods_received", "rejected"];
    case "awaiting_goods":
      return ["goods_received", "rejected"];
    case "goods_received":
      return ["inspected"];
    default:
      return [];
  }
}

// The money may go back from any open state: before delivery there is nothing to return, and after the
// customer proves the goods were sent we must not wait for them (§ 22 ods. 5 ZOS).
export const canRefund = (status: ReturnStatus) => !RETURN_DONE.includes(status);

export interface ReturnItem {
  order_item_id: string;
  quantity: number;
}

export interface OrderLine {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  lineGrossCents: number;
}

export interface ExistingReturn {
  status: ReturnStatus;
  items: ReturnItem[] | null; // null = whole order
}

// Lines (with the quantity) a new withdrawal may still cover; rejected withdrawals do not count.
export function remainingLines(lines: OrderLine[], returns: ExistingReturn[]): OrderLine[] {
  const live = returns.filter((r) => r.status !== "rejected");
  if (live.some((r) => r.items == null)) return [];
  const taken = new Set(live.flatMap((r) => r.items ?? []).map((i) => i.order_item_id));
  return lines.filter((l) => !taken.has(l.id));
}

// Stored form of the selection: null when it is the whole order (first withdrawal, every line).
export function toReturnItems(selected: OrderLine[], all: OrderLine[], hadEarlier: boolean): ReturnItem[] | null {
  if (!hadEarlier && selected.length === all.length) return null;
  return selected.map((l) => ({ order_item_id: l.id, quantity: l.quantity }));
}

// Suggested refund: the whole order incl. delivery, or the withdrawn lines only (docs/pravne/B §3: on a
// partial withdrawal delivery is neither refunded nor charged extra). Never more than is still refundable.
export function suggestedRefundCents(opts: {
  items: ReturnItem[] | null;
  lines: OrderLine[];
  orderTotalCents: number;
  refundableCents: number;
}): number {
  let cents = opts.orderTotalCents;
  if (opts.items) {
    cents = opts.items.reduce((sum, i) => {
      const line = opts.lines.find((l) => l.id === i.order_item_id);
      return line ? sum + Math.round((line.lineGrossCents * i.quantity) / line.quantity) : sum;
    }, 0);
  }
  return Math.max(0, Math.min(cents, opts.refundableCents));
}

export interface NoticeInput {
  seller: { name: string; address: string; email: string | null };
  orderNumber: string;
  orderedAt: string;
  deliveredAt: string | null;
  lines: OrderLine[]; // the withdrawn lines
  wholeOrder: boolean;
  name: string;
  email: string;
  reason?: string | null;
  submittedAt: string | null; // null in the preview before sending
  channel: ReturnChannel;
}

// The withdrawal as the consumer sends it (wording of the model form, príloha č. 2 ZOS). Stored verbatim in
// returns.notice_text and shown on the confirmation, so it must say what was sent, by whom and when.
export function withdrawalNotice(n: NoticeInput): string {
  const lines = n.lines.map((l) => `– ${l.quantity}× ${l.name}${l.sku ? ` (${l.sku})` : ""}`);
  const sent =
    n.submittedAt == null
      ? "doplní sa pri odoslaní"
      : `${formatDateTime(n.submittedAt)}${
          n.channel === "manual" ? " (prijaté e-mailom alebo listom)" : " (online funkcia „Odstúpiť od zmluvy tu“)"
        }`;
  return [
    `Komu: ${n.seller.name}, ${n.seller.address}${n.seller.email ? `, e-mail: ${n.seller.email}` : ""}`,
    "",
    n.wholeOrder
      ? `Týmto oznamujem, že odstupujem od zmluvy č. ${n.orderNumber} o dodaní tohto tovaru:`
      : `Týmto oznamujem, že odstupujem od zmluvy č. ${n.orderNumber} v časti o dodaní tohto tovaru:`,
    ...lines,
    "",
    `Dátum objednania: ${formatDate(n.orderedAt)}`,
    `Dátum prijatia: ${n.deliveredAt ? formatDate(n.deliveredAt) : "tovar ešte nebol prevzatý"}`,
    `Meno a priezvisko spotrebiteľa: ${n.name}`,
    `E-mail na potvrdenie: ${n.email}`,
    ...(n.reason ? [`Dôvod (nepovinný): ${n.reason}`] : []),
    `Dátum a čas odoslania: ${sent}`,
  ].join("\n");
}
