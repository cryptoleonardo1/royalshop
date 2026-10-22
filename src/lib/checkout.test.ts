import { describe, expect, it } from "vitest";
import { buildQuote, type PricedProduct } from "./cart-pricing";
import { orderSnapshots, parseCheckout } from "./checkout-schema";

const shippingRates = [
  { name: "balík do 40 kg", maxKg: 40, priceCents: 990 },
  { name: "paleta do 100 kg", maxKg: 100, priceCents: 4900 },
  { name: "paleta do 300 kg", maxKg: 300, priceCents: 8900 },
  { name: "paleta nad 300 kg", maxKg: null, priceCents: 14900 },
];
const settings = { shippingRates, freeShippingThresholdCents: null, handlingDays: 1 };

function priced(slug: string, over: Partial<PricedProduct> = {}): PricedProduct {
  return {
    id: slug,
    slug,
    name: slug,
    sku: null,
    priceGrossCents: 12300,
    vatRate: 23,
    shippingClass: "courier",
    weightKg: 15,
    leadDaysMax: 2,
    image: null,
    ...over,
  };
}

const products = new Map([
  ["drill", priced("drill")],
  ["plate", priced("plate", { priceGrossCents: 150000, shippingClass: "own_transport", weightKg: 90, leadDaysMax: 5 })],
  ["unweighed", priced("unweighed", { weightKg: null })],
  ["saw", priced("saw", { shippingClass: "pickup_only" })],
]);
// Monday 12 Oct 2026, noon in Bratislava
const now = new Date("2026-10-12T10:00:00Z");

describe("buildQuote", () => {
  it("prices a courier cart with VAT recap including shipping", () => {
    const q = buildQuote({ lines: [{ slug: "drill", quantity: 2 }], products, settings, now });
    expect(q.subtotalGrossCents).toBe(24600);
    expect(q.method).toBe("courier");
    expect(q.shippingCents).toBe(990);
    expect(q.totals.grossCents).toBe(24600 + 990);
    expect(q.totals.netCents + q.totals.vatCents).toBe(q.totals.grossCents);
    // 2 days supplier + 1 test + 1 courier = Friday
    expect(q.estimatedDelivery).toBe("2026-10-16");
  });

  it("merges duplicate lines, caps quantity and reports unknown products", () => {
    const q = buildQuote({
      lines: [
        { slug: "drill", quantity: 60 },
        { slug: "drill", quantity: 60 },
        { slug: "gone", quantity: 1 },
      ],
      products,
      settings,
      now,
    });
    expect(q.lines).toHaveLength(1);
    expect(q.lines[0].quantity).toBe(99);
    expect(q.missing).toEqual(["gone"]);
  });

  it("prices delivery by the weight of the whole order", () => {
    const parcel = buildQuote({ lines: [{ slug: "drill", quantity: 2 }], products, settings, now }); // 30 kg
    expect(parcel.shippingCents).toBe(990);
    expect(parcel.deliveryRate.name).toBe("balík do 40 kg");
    const pallet = buildQuote({ lines: [{ slug: "drill", quantity: 3 }], products, settings, now }); // 45 kg
    expect(pallet.shippingCents).toBe(4900);
    const heavy = buildQuote({
      lines: [
        { slug: "plate", quantity: 1 },
        { slug: "drill", quantity: 1 },
      ],
      products,
      settings,
      now,
    }); // 105 kg
    expect(heavy.weightKg).toBe(105);
    expect(heavy.options.map((o) => o.method)).toEqual(["courier", "pickup_senec"]);
    expect(heavy.shippingCents).toBe(8900);
  });

  it("prices a product without a weight in the heaviest band", () => {
    const q = buildQuote({ lines: [{ slug: "unweighed", quantity: 1 }], products, settings, now });
    expect(q.weightKg).toBeNull();
    expect(q.shippingCents).toBe(14900);
  });

  it("has no free shipping unless a threshold is set; pickup is always free", () => {
    const big = buildQuote({ lines: [{ slug: "plate", quantity: 2 }], products, settings, now });
    expect(big.shippingCents).toBe(8900);
    expect(big.remainingForFreeShippingCents).toBeNull();
    const free = buildQuote({
      lines: [{ slug: "plate", quantity: 2 }],
      products,
      settings: { ...settings, freeShippingThresholdCents: 200000 },
      now,
    });
    expect(free.shippingCents).toBe(0);
    const pickup = buildQuote({ lines: [{ slug: "drill", quantity: 1 }], products, settings, method: "pickup_senec", now });
    expect(pickup.shippingCents).toBe(0);
    const pickupOnly = buildQuote({ lines: [{ slug: "saw", quantity: 1 }], products, settings, now });
    expect(pickupOnly.options.map((o) => o.method)).toEqual(["pickup_senec"]);
  });

  it("never exposes extra product fields such as purchase price", () => {
    const withCost = new Map([["drill", { ...priced("drill"), purchaseNetCents: 5000 }]]);
    const q = buildQuote({ lines: [{ slug: "drill", quantity: 1 }], products: withCost, settings, now });
    expect(JSON.stringify(q)).not.toContain("purchase");
  });
});

function form(values: Record<string, string>) {
  const f = new FormData();
  Object.entries(values).forEach(([k, v]) => f.set(k, v));
  return f;
}

const valid = {
  customerType: "person",
  firstName: "Jana",
  lastName: "Kováčová",
  email: "Jana@Example.sk ",
  phone: "+421 900 123 456",
  street: "Hlavná 12",
  city: "Pezinok",
  zip: "90201",
  shippingMethod: "courier",
  terms: "on",
  lines: JSON.stringify([{ slug: "drill", quantity: 1 }]),
};

describe("checkout validation", () => {
  it("accepts a consumer order and normalises fields", () => {
    const r = parseCheckout(form(valid));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.email).toBe("jana@example.sk");
    expect(r.data.zip).toBe("902 01");
    const snap = orderSnapshots(r.data);
    expect(snap.company).toBeNull();
    expect(snap.shipping?.street).toBe("Hlavná 12");
  });

  it("requires the unticked terms checkbox to be ticked", () => {
    const { terms: _omit, ...rest } = valid;
    void _omit;
    const r = parseCheckout(form(rest));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.terms).toBeTruthy();
  });

  it("requires company identifiers for business orders", () => {
    const r = parseCheckout(form({ ...valid, customerType: "company", ico: "123" }));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.companyName).toBeTruthy();
      expect(r.errors.ico).toBeTruthy();
      expect(r.errors.dic).toBeTruthy();
    }
  });

  it("no longer accepts the retired own transport and drops the address for pickup", () => {
    const own = parseCheckout(form({ ...valid, shippingMethod: "own_transport" }));
    expect(own.ok).toBe(false);
    if (!own.ok) expect(own.errors.shippingMethod).toBeTruthy();
    const pickup = parseCheckout(form({ ...valid, shippingMethod: "pickup_senec" }));
    expect(pickup.ok && orderSnapshots(pickup.data).shipping).toBeNull();
  });

  it("rejects an empty or forged cart", () => {
    const r = parseCheckout(form({ ...valid, lines: JSON.stringify([{ slug: "x", quantity: 500 }]) }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.lines).toBeTruthy();
  });
});

describe("checkout validation messages", () => {
  it("reports missing fields in Slovak", () => {
    const r = parseCheckout(form({ customerType: "person", shippingMethod: "courier", lines: valid.lines }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.firstName).toBe("Zadajte meno");
    expect(r.errors.email).toBe("Zadajte e-mail");
    expect(r.errors.zip).toBe("Zadajte PSČ");
    expect(Object.values(r.errors).join(" ")).not.toMatch(/Invalid input/);
  });
});
