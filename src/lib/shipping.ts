import type { ShippingMethod } from "./order-state";

// pickup_only = cannot be shipped at all. The other classes no longer change the price: delivery is priced
// by the total weight of the order (rates below). own_transport stays as a label for very heavy machines.
export type ShippingClass = "courier" | "own_transport" | "pickup_only";

// One weight band of delivery to an address anywhere in Slovakia, price incl. VAT.
// maxKg null = everything heavier than the previous band.
export interface ShippingRate {
  name: string;
  maxKg: number | null;
  priceCents: number;
}

export interface ShippingSettings {
  rates: ShippingRate[];
  freeShippingThresholdCents: number | null; // null = no free shipping
}

// Placeholder bands until the carrier quotes arrive (company_settings.shipping_rates overrides them).
export const DEFAULT_SHIPPING_RATES: ShippingRate[] = [
  { name: "balík do 40 kg", maxKg: 40, priceCents: 990 },
  { name: "paleta do 100 kg", maxKg: 100, priceCents: 4900 },
  { name: "paleta do 300 kg", maxKg: 300, priceCents: 8900 },
  { name: "paleta nad 300 kg", maxKg: null, priceCents: 14900 },
];

// Delivery to an address, or pickup in the shop. Only pickup-only items rule out delivery.
export function availableMethods(classes: ShippingClass[]): ShippingMethod[] {
  if (classes.includes("pickup_only")) return ["pickup_senec"];
  return ["courier", "pickup_senec"];
}

// Shipping weight of the order. A product without a weight is priced in the heaviest band (null).
export function orderWeightKg(lines: { weightKg: number | null; quantity: number }[]): number | null {
  let total = 0;
  for (const l of lines) {
    if (l.weightKg == null) return null;
    total += l.weightKg * l.quantity;
  }
  return Math.round(total * 10) / 10;
}

export function rateFor(weightKg: number | null, rates: ShippingRate[]): ShippingRate {
  const sorted = [...rates].sort((a, b) => (a.maxKg ?? Infinity) - (b.maxKg ?? Infinity));
  if (sorted.length === 0) throw new Error("No shipping rates configured");
  if (weightKg == null) return sorted[sorted.length - 1];
  return sorted.find((r) => r.maxKg == null || weightKg <= r.maxKg) ?? sorted[sorted.length - 1];
}

// Cheapest delivery band, for "doprava od 9,90 €" copy.
export const cheapestRateCents = (rates: ShippingRate[]) => Math.min(...rates.map((r) => r.priceCents));

export function shippingPrice(
  method: ShippingMethod,
  subtotalGrossCents: number,
  weightKg: number | null,
  settings: ShippingSettings,
): number {
  if (method === "pickup_senec") return 0;
  if (settings.freeShippingThresholdCents != null && subtotalGrossCents >= settings.freeShippingThresholdCents) return 0;
  return rateFor(weightKg, settings.rates).priceCents;
}

// Business days (Mon–Fri) after `from`. Slovak public holidays are not modelled in the demo.
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  return d;
}

// Slowest supplier + test/repack + transport (courier/own transport next business day, pickup same day).
export function estimateDelivery(
  supplierLeadDaysMax: number[],
  handlingDays: number,
  method: ShippingMethod,
  from = new Date(),
): Date {
  const lead = Math.max(0, ...supplierLeadDaysMax);
  const transport = method === "pickup_senec" ? 0 : 1;
  return addBusinessDays(from, lead + handlingDays + transport);
}
