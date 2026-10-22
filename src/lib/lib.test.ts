import { describe, expect, it } from "vitest";
import { computeLine, computeTotals, formatEur, marginStats, netFromGross } from "./money";
import { allowedNextStatuses, canTransition, canWithdraw, withdrawalDeadline } from "./order-state";
import { addBusinessDays, availableMethods, estimateDelivery, orderWeightKg, rateFor, shippingPrice } from "./shipping";

describe("money", () => {
  it("derives net from gross with half-away-from-zero rounding", () => {
    expect(netFromGross(12300, 23)).toBe(10000);
    expect(netFromGross(100, 23)).toBe(81); // 81.30…
    expect(netFromGross(5, 23)).toBe(4); // 4.065 → 4
  });

  it("keeps line gross exactly what the customer pays", () => {
    const line = computeLine({ unitPriceGrossCents: 49990, quantity: 3, vatRate: 23 });
    expect(line.lineGrossCents).toBe(149970);
    expect(line.lineNetCents + line.lineVatCents).toBe(149970);
    expect(line.lineNetCents).toBe(121927);
  });

  it("sums totals per rate without re-rounding", () => {
    const a = { ...computeLine({ unitPriceGrossCents: 999, quantity: 1, vatRate: 23 }), vatRate: 23 };
    const b = { ...computeLine({ unitPriceGrossCents: 1999, quantity: 2, vatRate: 23 }), vatRate: 23 };
    const t = computeTotals([a, b]);
    expect(t.grossCents).toBe(999 + 3998);
    expect(t.netCents + t.vatCents).toBe(t.grossCents);
    expect(t.recap).toHaveLength(1);
  });

  it("formats EUR in Slovak", () => {
    expect(formatEur(123456).replace(/\s/g, " ")).toBe("1 234,56 €");
  });

  it("computes markup and margin", () => {
    const m = marginStats(12300, 23, 8000);
    expect(m.saleNetCents).toBe(10000);
    expect(m.markupPct).toBeCloseTo(25);
    expect(m.marginPct).toBeCloseTo(20);
  });
});

describe("order state", () => {
  it("routes dispatch by shipping method", () => {
    expect(allowedNextStatuses("tested", "courier")).toEqual(["shipped"]);
    expect(allowedNextStatuses("tested", "pickup_senec")).toEqual(["ready_for_pickup"]);
    expect(canTransition("tested", "shipped", "pickup_senec")).toBe(false);
  });

  it("cannot cancel after goods arrived", () => {
    expect(canTransition("received_at_branch", "cancelled", "courier")).toBe(false);
  });

  it("allows withdrawal for consumers within 14 days only", () => {
    const delivered = "2026-10-01T10:00:00Z";
    const order = { customer_type: "person" as const, status: "delivered" as const, delivered_at: delivered };
    expect(canWithdraw(order, new Date("2026-10-15T12:00:00Z"))).toBe(true);
    expect(canWithdraw(order, new Date("2026-10-16T12:00:00Z"))).toBe(false);
    expect(canWithdraw({ ...order, customer_type: "company" }, new Date("2026-10-02T00:00:00Z"))).toBe(false);
    expect(withdrawalDeadline(new Date(delivered)).getDate()).toBe(15);
  });
});

describe("shipping", () => {
  const rates = [
    { name: "balík do 40 kg", maxKg: 40, priceCents: 990 },
    { name: "paleta do 100 kg", maxKg: 100, priceCents: 4900 },
    { name: "paleta nad 100 kg", maxKg: null, priceCents: 8900 },
  ];

  it("offers delivery for everything except pickup-only items", () => {
    expect(availableMethods(["courier", "own_transport"])).toEqual(["courier", "pickup_senec"]);
    expect(availableMethods(["courier", "pickup_only"])).toEqual(["pickup_senec"]);
  });

  it("picks the band by weight, band limits inclusive", () => {
    expect(rateFor(40, rates).priceCents).toBe(990);
    expect(rateFor(40.1, rates).priceCents).toBe(4900);
    expect(rateFor(500, rates).priceCents).toBe(8900);
    expect(rateFor(null, rates).priceCents).toBe(8900);
    expect(orderWeightKg([{ weightKg: 13.2, quantity: 2 }, { weightKg: 5, quantity: 1 }])).toBe(31.4);
    expect(orderWeightKg([{ weightKg: null, quantity: 1 }])).toBeNull();
  });

  it("is free only above a configured threshold, pickup always", () => {
    expect(shippingPrice("courier", 999999, 10, { rates, freeShippingThresholdCents: null })).toBe(990);
    expect(shippingPrice("courier", 200000, 10, { rates, freeShippingThresholdCents: 200000 })).toBe(0);
    expect(shippingPrice("pickup_senec", 100, 500, { rates, freeShippingThresholdCents: null })).toBe(0);
  });

  it("skips weekends", () => {
    const fri = new Date("2026-10-09T10:00:00");
    expect(addBusinessDays(fri, 1).getDay()).toBe(1);
    // Makita 2 days + 1 test + 1 courier from Friday → Thursday
    expect(estimateDelivery([2], 1, "courier", fri).getDate()).toBe(15);
  });
});
