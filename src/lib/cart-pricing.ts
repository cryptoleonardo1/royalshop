import { computeLine, computeTotals, type Totals } from "./money";
import type { ShippingMethod } from "./order-state";
import { availableMethods, estimateDelivery, shippingPrice, type ShippingClass, type ShippingZone } from "./shipping";

// Authoritative cart maths: the same function prices the cart page, the checkout summary and the
// order that gets written, so what the customer sees is exactly what Stripe charges.

// Shipping is a taxable service following the main supply; all catalog goods are 23 %.
export const SHIPPING_VAT_RATE = 23;

export interface PricedProduct {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  ean?: string | null;
  priceGrossCents: number;
  vatRate: number;
  shippingClass: ShippingClass;
  leadDaysMax: number;
  supplierId?: string | null;
  image: string | null;
}

export interface QuoteLine {
  product: PricedProduct;
  quantity: number;
  lineGrossCents: number;
  lineNetCents: number;
  lineVatCents: number;
}

export interface ShippingOption {
  method: ShippingMethod;
  priceCents: number | null; // null = own transport before a zone is chosen
  estimatedDelivery: string; // ISO date (yyyy-mm-dd)
}

export interface Quote {
  lines: QuoteLine[];
  missing: string[]; // slugs no longer sold
  subtotalGrossCents: number;
  method: ShippingMethod;
  zoneId: string | null;
  shippingCents: number | null;
  options: ShippingOption[];
  freeShippingThresholdCents: number;
  remainingForFreeShippingCents: number;
  totals: Totals; // goods + shipping (shipping counted as 0 until known)
  estimatedDelivery: string;
}

export interface QuoteInput {
  lines: { slug: string; quantity: number }[];
  products: Map<string, PricedProduct>;
  settings: { courierPriceCents: number; freeShippingThresholdCents: number; handlingDays: number };
  zones: ShippingZone[];
  method?: ShippingMethod | null;
  zoneId?: string | null;
  now?: Date;
}

export const MAX_LINE_QTY = 99;

// Quotes are sent to the browser: copy only customer-safe fields, so extra data the caller loaded
// for the order snapshot (purchase price) can never ride along.
function publicFields(p: PricedProduct): PricedProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    ean: p.ean ?? null,
    priceGrossCents: p.priceGrossCents,
    vatRate: p.vatRate,
    shippingClass: p.shippingClass,
    leadDaysMax: p.leadDaysMax,
    supplierId: p.supplierId ?? null,
    image: p.image,
  };
}

const isoDate = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bratislava",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);

export function buildQuote({ lines, products, settings, zones, method, zoneId, now = new Date() }: QuoteInput): Quote {
  const merged = new Map<string, number>();
  for (const l of lines) {
    if (!Number.isInteger(l.quantity) || l.quantity < 1) continue;
    merged.set(l.slug, Math.min(MAX_LINE_QTY, (merged.get(l.slug) ?? 0) + l.quantity));
  }

  const missing: string[] = [];
  const quoteLines: QuoteLine[] = [];
  for (const [slug, quantity] of merged) {
    const product = products.get(slug);
    if (!product) {
      missing.push(slug);
      continue;
    }
    const line = computeLine({ unitPriceGrossCents: product.priceGrossCents, quantity, vatRate: product.vatRate });
    quoteLines.push({ product: publicFields(product), quantity, ...line });
  }

  const subtotal = quoteLines.reduce((s, l) => s + l.lineGrossCents, 0);
  const methods = availableMethods(quoteLines.map((l) => l.product.shippingClass));
  const chosen: ShippingMethod = method && methods.includes(method) ? method : methods[0];
  const zone = zones.find((z) => z.id === zoneId) ?? null;
  const leadMax = quoteLines.map((l) => l.product.leadDaysMax);

  const shippingSettings = {
    courier_price_cents: settings.courierPriceCents,
    free_shipping_threshold_cents: settings.freeShippingThresholdCents,
  };
  // Own transport is priced by zone; until one is picked the price is unknown (null), unless free.
  const priceFor = (m: ShippingMethod): number | null => {
    if (m === "own_transport" && !zone) return subtotal >= settings.freeShippingThresholdCents ? 0 : null;
    return shippingPrice(m, subtotal, shippingSettings, zone);
  };
  const options: ShippingOption[] = methods.map((m) => ({
    method: m,
    priceCents: priceFor(m),
    estimatedDelivery: isoDate(estimateDelivery(leadMax, settings.handlingDays, m, now)),
  }));
  const shippingCents = quoteLines.length ? priceFor(chosen) : 0;

  const goods = quoteLines.map((l) => ({ ...l, vatRate: l.product.vatRate }));
  const shippingLine =
    shippingCents && shippingCents > 0
      ? [
          {
            ...computeLine({ unitPriceGrossCents: shippingCents, quantity: 1, vatRate: SHIPPING_VAT_RATE }),
            vatRate: SHIPPING_VAT_RATE,
          },
        ]
      : [];

  return {
    lines: quoteLines,
    missing,
    subtotalGrossCents: subtotal,
    method: chosen,
    zoneId: zone?.id ?? null,
    shippingCents,
    options,
    freeShippingThresholdCents: settings.freeShippingThresholdCents,
    remainingForFreeShippingCents: Math.max(0, settings.freeShippingThresholdCents - subtotal),
    totals: computeTotals([...goods, ...shippingLine]),
    estimatedDelivery: options.find((o) => o.method === chosen)?.estimatedDelivery ?? isoDate(now),
  };
}
