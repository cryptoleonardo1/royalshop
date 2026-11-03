import { describe, expect, it } from "vitest";
import {
  allowedReturnSteps,
  canRefund,
  remainingLines,
  suggestedRefundCents,
  toReturnItems,
  withdrawalNotice,
  type OrderLine,
} from "./returns";
import { canCompleteOrder, withdrawalEligibility } from "./withdrawal";

const lines: OrderLine[] = [
  { id: "a", name: "Gölz FS125", sku: "FS125", quantity: 1, lineGrossCents: 250000 },
  { id: "b", name: "Diamantový kotúč", sku: null, quantity: 2, lineGrossCents: 40000 },
];

describe("withdrawal selection", () => {
  it("leaves out lines already withdrawn, ignoring rejected withdrawals", () => {
    expect(remainingLines(lines, [])).toHaveLength(2);
    expect(remainingLines(lines, [{ status: "requested", items: [{ order_item_id: "a", quantity: 1 }] }]).map((l) => l.id)).toEqual(["b"]);
    expect(remainingLines(lines, [{ status: "refunded", items: null }])).toEqual([]);
    expect(remainingLines(lines, [{ status: "rejected", items: null }])).toHaveLength(2);
  });

  it("stores a first full selection as the whole order", () => {
    expect(toReturnItems(lines, lines, false)).toBeNull();
    expect(toReturnItems([lines[0]], lines, false)).toEqual([{ order_item_id: "a", quantity: 1 }]);
    // the rest after an earlier partial withdrawal stays partial
    expect(toReturnItems([lines[1]], lines, true)).toEqual([{ order_item_id: "b", quantity: 2 }]);
  });
});

describe("refund suggestion", () => {
  it("refunds the whole order with delivery, or only the withdrawn lines", () => {
    expect(suggestedRefundCents({ items: null, lines, orderTotalCents: 298900, refundableCents: 298900 })).toBe(298900);
    expect(
      suggestedRefundCents({ items: [{ order_item_id: "b", quantity: 2 }], lines, orderTotalCents: 298900, refundableCents: 298900 }),
    ).toBe(40000);
  });

  it("never suggests more than is still refundable", () => {
    expect(suggestedRefundCents({ items: null, lines, orderTotalCents: 298900, refundableCents: 1000 })).toBe(1000);
  });
});

describe("return status", () => {
  it("moves goods forward and refunds from any open state", () => {
    expect(allowedReturnSteps("requested")).toContain("awaiting_goods");
    expect(allowedReturnSteps("goods_received")).toEqual(["inspected"]);
    expect(allowedReturnSteps("refunded")).toEqual([]);
    expect(canRefund("awaiting_goods")).toBe(true);
    expect(canRefund("rejected")).toBe(false);
  });
});

describe("withdrawal notice", () => {
  const base = {
    seller: { name: "Royal stroje s. r. o.", address: "Boldog 1, 925 23 Boldog", email: "info@royalstroje.sk" },
    orderNumber: "OBJ26-00013",
    orderedAt: "2026-11-02T10:00:00Z",
    deliveredAt: null,
    lines: [lines[0]],
    wholeOrder: true,
    name: "Ján Novák",
    email: "jan@example.sk",
    channel: "public_form" as const,
  };

  it("says what, who and when, in Bratislava time", () => {
    const text = withdrawalNotice({ ...base, submittedAt: "2026-11-03T13:05:00Z" });
    expect(text).toContain("odstupujem od zmluvy č. OBJ26-00013 o dodaní tohto tovaru:");
    expect(text).toContain("– 1× Gölz FS125 (FS125)");
    expect(text).toContain("Dátum prijatia: tovar ešte nebol prevzatý");
    expect(text).toContain("Meno a priezvisko spotrebiteľa: Ján Novák");
    expect(text).toMatch(/Dátum a čas odoslania: 3\. 11\. 2026,? 14:05 \(online funkcia/);
    expect(text).not.toContain("Dôvod");
  });

  it("marks a partial withdrawal and shows the optional reason", () => {
    const text = withdrawalNotice({ ...base, wholeOrder: false, reason: "Nesedí výkon", submittedAt: null });
    expect(text).toContain("v časti o dodaní tohto tovaru");
    expect(text).toContain("Dôvod (nepovinný): Nesedí výkon");
    expect(text).toContain("doplní sa pri odoslaní");
  });
});

describe("customer eligibility", () => {
  const person = { customer_type: "person" as const, status: "delivered" as const, delivered_at: "2026-10-01T10:00:00Z" };

  it("allows before delivery and until the deadline, not in the admin's post grace", () => {
    expect(withdrawalEligibility({ ...person, status: "confirmed", delivered_at: null }).allowed).toBe(true);
    expect(withdrawalEligibility(person, new Date("2026-10-15T20:00:00Z"))).toMatchObject({ allowed: true, daysLeft: 0 });
    expect(withdrawalEligibility(person, new Date("2026-10-17T08:00:00Z"))).toMatchObject({ allowed: false, block: "expired" });
  });

  it("explains why it is not possible", () => {
    expect(withdrawalEligibility({ ...person, customer_type: "company" }).block).toBe("company");
    expect(withdrawalEligibility({ ...person, status: "pending_payment", delivered_at: null }).block).toBe("unpaid");
    expect(withdrawalEligibility({ ...person, status: "cancelled", delivered_at: null }).block).toBe("cancelled");
    expect(withdrawalEligibility({ ...person, status: "reserved", delivered_at: null }).block).toBe("unpaid");
    expect(withdrawalEligibility({ ...person, contract_place: "on_premises" }).block).toBe("on_premises");
  });

  it("keeps the order open while a filed withdrawal is unsettled", () => {
    const after = new Date("2026-10-25T08:00:00Z");
    expect(canCompleteOrder({ ...person, hasWithdrawal: true, withdrawalPending: true }, after)).toBe(false);
    expect(canCompleteOrder({ ...person, hasWithdrawal: true, withdrawalPending: false }, after)).toBe(true);
  });
});
