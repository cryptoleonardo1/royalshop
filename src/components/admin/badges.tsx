import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-state";
import { WITHDRAWAL_WINDOW_LABELS, type WithdrawalInfo, type WithdrawalWindow } from "@/lib/withdrawal";
import css from "./admin.module.css";

type Tone = "red" | "amber" | "green" | "blue" | "accent" | undefined;

const dateFmt = new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "numeric", year: "numeric", timeZone: "Europe/Bratislava" });
const dateTimeFmt = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Bratislava",
});

export const fmtDate = (v: string | Date | null | undefined) => (v ? dateFmt.format(new Date(v)) : "–");
export const fmtDateTime = (v: string | Date | null | undefined) => (v ? dateTimeFmt.format(new Date(v)) : "–");

const STATUS_TONE: Partial<Record<OrderStatus, Tone>> = {
  pending_payment: undefined,
  paid: "accent",
  confirmed: "blue",
  ordered_from_supplier: "blue",
  received_at_branch: "blue",
  tested: "blue",
  shipped: "blue",
  out_for_delivery: "blue",
  ready_for_pickup: "blue",
  delivered: "green",
  completed: "green",
  cancelled: "red",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={css.badge} data-tone={STATUS_TONE[status]}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

const PAYMENT_LABEL: Record<string, [string, Tone]> = {
  unpaid: ["Nezaplatená", undefined],
  authorized: ["Blokovaná", "amber"],
  paid: ["Zaplatená", "green"],
  partially_refunded: ["Čiastočne vrátená", "amber"],
  refunded: ["Vrátená", "red"],
  failed: ["Zlyhala", "red"],
  cancelled: ["Zrušená", undefined],
};

export function PaymentBadge({ status }: { status: string }) {
  const [label, tone] = PAYMENT_LABEL[status] ?? [status, undefined];
  return (
    <span className={css.badge} data-tone={tone}>
      {label}
    </span>
  );
}

export const WINDOW_TONE: Record<WithdrawalWindow, Tone> = {
  open: "red",
  grace: "amber",
  before_delivery: "amber",
  withdrawn: "red",
  closed: "green",
  company: undefined,
  none: undefined,
};

// Slovak plural: 1 deň, 2–4 dni, 5+ dní
export const daysText = (n: number) => `${n} ${n === 1 ? "deň" : n >= 2 && n <= 4 ? "dni" : "dní"}`;

export function WindowBadge({ info }: { info: WithdrawalInfo }) {
  let label = WITHDRAWAL_WINDOW_LABELS[info.window];
  if (info.window === "open" && info.daysLeft != null) {
    label = info.daysLeft === 0 ? "Posledný deň lehoty" : `Plynie, ešte ${daysText(info.daysLeft)}`;
  }
  return (
    <span className={css.badge} data-tone={WINDOW_TONE[info.window]} title={info.deadline ? `Lehota do ${fmtDateTime(info.deadline)}` : undefined}>
      {label}
    </span>
  );
}
