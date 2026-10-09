// Money helpers. All amounts are integer cents (EUR).
//
// Shop prices are entered gross (incl. VAT). The amount the customer pays per line is fixed,
// so net/VAT are derived from the rounded gross — never the other way round — which keeps the
// invoice total identical to the Stripe charge. Rounding is half away from zero, like Postgres ROUND
// and crm_core's invoiceMath.round2.

export type VatRate = number; // percent, e.g. 23

export function roundHalfAwayFromZero(value: number): number {
  const sign = value < 0 ? -1 : 1;
  return sign * Math.round(Math.abs(value) + Number.EPSILON * Math.abs(value));
}

export function netFromGross(grossCents: number, vatRate: VatRate): number {
  return roundHalfAwayFromZero((grossCents * 100) / (100 + vatRate));
}

export interface LineInput {
  unitPriceGrossCents: number;
  quantity: number;
  vatRate: VatRate;
}

export interface LineAmounts {
  lineGrossCents: number;
  lineNetCents: number;
  lineVatCents: number;
  unitPriceNetCents: number;
}

export function computeLine({ unitPriceGrossCents, quantity, vatRate }: LineInput): LineAmounts {
  const lineGrossCents = unitPriceGrossCents * quantity;
  const lineNetCents = netFromGross(lineGrossCents, vatRate);
  return {
    lineGrossCents,
    lineNetCents,
    lineVatCents: lineGrossCents - lineNetCents,
    unitPriceNetCents: netFromGross(unitPriceGrossCents, vatRate),
  };
}

export interface VatRecapRow {
  vatRate: VatRate;
  netCents: number;
  vatCents: number;
  grossCents: number;
}

export interface Totals {
  netCents: number;
  vatCents: number;
  grossCents: number;
  recap: VatRecapRow[];
}

// Sums already-rounded lines; the recap is grouped per rate (highest first) and never re-rounded.
export function computeTotals(lines: (Omit<LineAmounts, "unitPriceNetCents"> & { vatRate: VatRate })[]): Totals {
  const byRate = new Map<VatRate, VatRecapRow>();
  lines.forEach((line) => {
    const rate = line.vatRate;
    const row = byRate.get(rate) ?? { vatRate: rate, netCents: 0, vatCents: 0, grossCents: 0 };
    row.netCents += line.lineNetCents;
    row.vatCents += line.lineVatCents;
    row.grossCents += line.lineGrossCents;
    byRate.set(rate, row);
  });
  const recap = [...byRate.values()].sort((a, b) => b.vatRate - a.vatRate);
  return {
    netCents: recap.reduce((s, r) => s + r.netCents, 0),
    vatCents: recap.reduce((s, r) => s + r.vatCents, 0),
    grossCents: recap.reduce((s, r) => s + r.grossCents, 0),
    recap,
  };
}

const eurFormatter = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEur(cents: number): string {
  // Intl uses a narrow no-break space before €; keep it so prices never wrap.
  return eurFormatter.format(cents / 100);
}

export function eurToCents(eur: number): number {
  return roundHalfAwayFromZero(eur * 100);
}

// Markup over purchase price and margin of the net sale price, both in percent (admin overview only).
export function marginStats(saleGrossCents: number, vatRate: VatRate, purchaseNetCents: number) {
  const saleNet = netFromGross(saleGrossCents, vatRate);
  const profit = saleNet - purchaseNetCents;
  return {
    saleNetCents: saleNet,
    profitCents: profit,
    markupPct: purchaseNetCents > 0 ? (profit / purchaseNetCents) * 100 : null,
    marginPct: saleNet > 0 ? (profit / saleNet) * 100 : null,
  };
}
