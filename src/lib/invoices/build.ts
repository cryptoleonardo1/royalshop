// Invoice and credit-note drafts from an order. Pure: no DB, so the numbers are unit-tested.
// Lines reuse the checkout math (src/lib/money.ts), so the invoice total equals what the customer paid.

import { computeLine, computeTotals, formatEur as eur, netFromGross, type Totals } from "../money";
import { SHIPPING_VAT_RATE } from "../cart-pricing";

export type InvoicePaymentMethod = "karta" | "prevod" | "hotovost";

// payments.provider → invoices.payment_method (card in the shop is a card payment too)
export const PAYMENT_METHOD_BY_PROVIDER: Record<string, InvoicePaymentMethod> = {
  stripe: "karta",
  card_terminal: "karta",
  cash: "hotovost",
  bank_transfer: "prevod",
};

export const PAYMENT_METHOD_LABEL: Record<InvoicePaymentMethod, string> = {
  karta: "platobnou kartou",
  prevod: "bankovým prevodom",
  hotovost: "v hotovosti",
};

export interface DraftLine {
  position: number;
  code: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price_net_cents: number;
  vat_rate: number;
  line_net_cents: number;
  line_vat_cents: number;
  line_gross_cents: number;
}

export interface InvoiceOrder {
  orderNumber: string;
  customerType: "person" | "company";
  email: string;
  phone: string | null;
  billing: { name: string; contact?: string; street: string; city: string; zip: string };
  company: { name: string; ico: string; dic: string; ic_dph: string | null } | null;
  items: { name: string; sku: string | null; quantity: number; unitPriceGrossCents: number; vatRate: number }[];
  shippingPriceCents: number;
  shippingLabel: string;
  totalGrossCents: number;
  // first captured payment: its day is the DUZP
  payment: { provider: string; capturedAt: string };
}

export interface SupplierSnapshot {
  name: string;
  street: string | null;
  city: string | null;
  zip: string | null;
  ico: string | null;
  dic: string | null;
  ic_dph: string | null;
  register_info: string | null;
  iban: string | null;
  swift: string | null;
  email: string | null;
  phone: string | null;
  web: string | null;
}

export interface CustomerSnapshot {
  name: string;
  contact: string | null;
  street: string;
  city: string;
  zip: string;
  ico: string | null;
  dic: string | null;
  ic_dph: string | null;
  email: string;
  phone: string | null;
}

export function customerSnapshot(o: Pick<InvoiceOrder, "billing" | "company" | "email" | "phone">): CustomerSnapshot {
  return {
    name: o.company?.name ?? o.billing.name,
    contact: o.company ? (o.billing.contact ?? null) : null,
    street: o.billing.street,
    city: o.billing.city,
    zip: o.billing.zip,
    ico: o.company?.ico ?? null,
    dic: o.company?.dic ?? null,
    ic_dph: o.company?.ic_dph ?? null,
    email: o.email,
    phone: o.phone,
  };
}

function line(position: number, code: string | null, description: string, quantity: number, unitGross: number, vatRate: number): DraftLine {
  const a = computeLine({ unitPriceGrossCents: unitGross, quantity, vatRate });
  return {
    position,
    code,
    description,
    quantity,
    unit: "ks",
    unit_price_net_cents: a.unitPriceNetCents,
    vat_rate: vatRate,
    line_net_cents: a.lineNetCents,
    line_vat_cents: a.lineVatCents,
    line_gross_cents: a.lineGrossCents,
  };
}

export function totalsOf(lines: DraftLine[]): Totals {
  return computeTotals(
    lines.map((l) => ({
      vatRate: l.vat_rate,
      lineNetCents: l.line_net_cents,
      lineVatCents: l.line_vat_cents,
      lineGrossCents: l.line_gross_cents,
    })),
  );
}

export function recapJson(t: Totals) {
  return t.recap.map((r) => ({ vat_rate: r.vatRate, net_cents: r.netCents, vat_cents: r.vatCents, gross_cents: r.grossCents }));
}

const sk = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)}. ${Number(m)}. ${y}`;
};

// Day of an instant in Bratislava, as YYYY-MM-DD.
export function bratislavaIsoDay(instant: string | Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Bratislava" }).format(new Date(instant));
}

export function buildInvoiceDraft(o: InvoiceOrder, issueDate: string) {
  const lines = o.items.map((i, idx) => line(idx + 1, i.sku, i.name, i.quantity, i.unitPriceGrossCents, i.vatRate));
  if (o.shippingPriceCents > 0) {
    lines.push(line(lines.length + 1, null, o.shippingLabel, 1, o.shippingPriceCents, SHIPPING_VAT_RATE));
  }
  const totals = totalsOf(lines);
  if (totals.grossCents !== o.totalGrossCents) {
    throw new Error(`Order ${o.orderNumber}: invoice total ${totals.grossCents} differs from the order total ${o.totalGrossCents}`);
  }
  const method = PAYMENT_METHOD_BY_PROVIDER[o.payment.provider] ?? "karta";
  const paidDay = bratislavaIsoDay(o.payment.capturedAt);
  return {
    invoice: {
      type: "invoice" as const,
      payment_method: method,
      paid_at: o.payment.capturedAt,
      tax_point_date: paidDay,
      // paid in full before issue: nothing is due
      due_date: issueDate,
      header_text: `Fakturujeme Vám tovar podľa objednávky č. ${o.orderNumber}.`,
      note:
        `Uhradené ${PAYMENT_METHOD_LABEL[method]} dňa ${sk(paidDay)}. Neuhrádzajte.` +
        (method === "hotovost" ? " K platbe bol vydaný pokladničný doklad (eKasa)." : ""),
      customer_snapshot: customerSnapshot(o),
      total_net_cents: totals.netCents,
      total_vat_cents: totals.vatCents,
      total_gross_cents: totals.grossCents,
      vat_recap: recapJson(totals),
    },
    lines,
  };
}

export interface IssuedInvoiceRef {
  invoiceNumber: string;
  totalGrossCents: number;
  lines: DraftLine[];
}

// Credit note for a refund of `refundCents` (positive). The whole invoice refunded → its lines mirrored;
// less → one line per VAT rate, the amount split by each rate's share of the invoice (last rate takes the rest).
export function buildCreditNoteLines(inv: IssuedInvoiceRef, refundCents: number, reason: string): DraftLine[] {
  if (refundCents <= 0) throw new Error("Credit note amount must be positive");
  if (refundCents > inv.totalGrossCents) throw new Error(`Credit note ${refundCents} exceeds invoice ${inv.invoiceNumber}`);
  if (refundCents === inv.totalGrossCents) {
    return inv.lines.map((l, idx) => ({
      ...l,
      position: idx + 1,
      unit_price_net_cents: -l.unit_price_net_cents,
      line_net_cents: -l.line_net_cents,
      line_vat_cents: -l.line_vat_cents,
      line_gross_cents: -l.line_gross_cents,
    }));
  }
  const recap = totalsOf(inv.lines).recap;
  const out: DraftLine[] = [];
  let left = refundCents;
  recap.forEach((r, idx) => {
    const gross = idx === recap.length - 1 ? left : Math.round((refundCents * r.grossCents) / inv.totalGrossCents);
    left -= gross;
    if (gross === 0) return;
    const net = netFromGross(gross, r.vatRate);
    out.push({
      position: out.length + 1,
      code: null,
      description: `${reason} (DPH ${r.vatRate} %)`,
      quantity: 1,
      unit: "ks",
      unit_price_net_cents: -net,
      vat_rate: r.vatRate,
      line_net_cents: -net,
      line_vat_cents: -(gross - net),
      line_gross_cents: -gross,
    });
  });
  if (recap.length === 1) out[0].description = reason;
  return out;
}

export function buildCreditNoteDraft(
  inv: IssuedInvoiceRef & { customerSnapshot: CustomerSnapshot; paymentMethod: InvoicePaymentMethod },
  refundCents: number,
  reason: string,
  refundedAt: string,
) {
  const lines = buildCreditNoteLines(inv, refundCents, reason);
  const totals = totalsOf(lines);
  const day = bratislavaIsoDay(refundedAt);
  return {
    invoice: {
      type: "credit_note" as const,
      payment_method: inv.paymentMethod,
      paid_at: refundedAt,
      tax_point_date: day,
      due_date: day,
      header_text: `Opravný doklad k faktúre č. ${inv.invoiceNumber}. Dôvod opravy: ${reason}.`,
      note: `Vrátená suma ${eur(refundCents)} ${PAYMENT_METHOD_LABEL[inv.paymentMethod]}.`,
      customer_snapshot: inv.customerSnapshot,
      total_net_cents: totals.netCents,
      total_vat_cents: totals.vatCents,
      total_gross_cents: totals.grossCents,
      vat_recap: recapJson(totals),
    },
    lines,
  };
}
