import type { ShippingMethod } from "./order-state";

export type ShippingClass = "courier" | "own_transport" | "pickup_only";

export interface ShippingZone {
  id: string;
  name: string;
  max_km: number;
  price_cents: number;
}

export interface ShippingSettings {
  courier_price_cents: number;
  free_shipping_threshold_cents: number;
}

// Which delivery methods a cart can use: any heavy item forces own transport (or pickup).
export function availableMethods(classes: ShippingClass[]): ShippingMethod[] {
  if (classes.includes("pickup_only")) return ["pickup_senec"];
  if (classes.includes("own_transport")) return ["own_transport", "pickup_senec"];
  return ["courier", "pickup_senec"];
}

export function shippingPrice(
  method: ShippingMethod,
  subtotalGrossCents: number,
  settings: ShippingSettings,
  zone?: ShippingZone | null,
): number {
  if (method === "pickup_senec") return 0;
  if (subtotalGrossCents >= settings.free_shipping_threshold_cents) return 0;
  if (method === "courier") return settings.courier_price_cents;
  if (!zone) throw new Error("Own transport requires a zone");
  return zone.price_cents;
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
