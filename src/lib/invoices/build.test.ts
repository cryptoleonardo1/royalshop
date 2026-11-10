import { describe, expect, it } from "vitest";
import { buildCreditNoteDraft, buildCreditNoteLines, buildInvoiceDraft, bratislavaIsoDay, totalsOf, type InvoiceOrder } from "./build";

const order: InvoiceOrder = {
  orderNumber: "OBJ26-00011",
  customerType: "person",
  email: "marek@example.sk",
  phone: null,
  billing: { name: "Marek Testovací", contact: "Marek Testovací", street: "Hlavná 1", city: "Senec", zip: "903 01" },
  company: null,
  items: [
    { name: "Gölz TS250A", sku: "TS250A", quantity: 1, unitPriceGrossCents: 232470, vatRate: 23 },
    { name: "Diamantový kotúč", sku: "LB20", quantity: 2, unitPriceGrossCents: 18999, vatRate: 23 },
  ],
  shippingPriceCents: 4900,
  shippingLabel: "Doprava kuriérom",
  totalGrossCents: 232470 + 2 * 18999 + 4900,
  payment: { provider: "cash", capturedAt: "2026-11-09T23:30:00Z" },
};

describe("invoice draft", () => {
  it("matches the order total line by line, shipping included", () => {
    const { invoice, lines } = buildInvoiceDraft(order, "2026-11-10");
    expect(lines).toHaveLength(3);
    expect(lines[2]).toMatchObject({ description: "Doprava kuriérom", vat_rate: 23, line_gross_cents: 4900 });
    expect(invoice.total_gross_cents).toBe(order.totalGrossCents);
    expect(invoice.total_net_cents + invoice.total_vat_cents).toBe(invoice.total_gross_cents);
    lines.forEach((l) => expect(l.line_net_cents + l.line_vat_cents).toBe(l.line_gross_cents));
  });

  it("dates the tax point to the Bratislava day of the payment and marks it paid", () => {
    const { invoice } = buildInvoiceDraft(order, "2026-11-12");
    // 23:30 UTC on the 9th is already the 10th in Bratislava
    expect(invoice.tax_point_date).toBe("2026-11-10");
    expect(invoice.due_date).toBe("2026-11-12");
    expect(invoice.payment_method).toBe("hotovost");
    expect(invoice.note).toContain("Uhradené v hotovosti dňa 10. 11. 2026");
    expect(invoice.note).toContain("eKasa");
  });

  it("refuses an invoice that would not equal the order total", () => {
    expect(() => buildInvoiceDraft({ ...order, totalGrossCents: order.totalGrossCents + 1 }, "2026-11-10")).toThrow(/differs/);
  });

  it("puts the company on a B2B invoice", () => {
    const { invoice } = buildInvoiceDraft(
      {
        ...order,
        customerType: "company",
        company: { name: "Stavby s.r.o.", ico: "12345678", dic: "2020123456", ic_dph: "SK2020123456" },
        payment: { provider: "stripe", capturedAt: "2026-11-10T08:00:00Z" },
      },
      "2026-11-10",
    );
    expect(invoice.customer_snapshot).toMatchObject({ name: "Stavby s.r.o.", ico: "12345678", contact: "Marek Testovací" });
    expect(invoice.payment_method).toBe("karta");
  });
});

describe("credit note", () => {
  const { invoice, lines } = buildInvoiceDraft(order, "2026-11-10");
  const ref = { invoiceNumber: "202600001", totalGrossCents: invoice.total_gross_cents, lines };

  it("mirrors every line when the whole invoice is refunded", () => {
    const cn = buildCreditNoteLines(ref, invoice.total_gross_cents, "Zrušenie objednávky");
    expect(cn).toHaveLength(3);
    const t = totalsOf(cn);
    expect(t.grossCents).toBe(-invoice.total_gross_cents);
    expect(t.netCents).toBe(-invoice.total_net_cents);
  });

  it("books a partial refund as one negative line that adds up", () => {
    const cn = buildCreditNoteLines(ref, 12345, "Odstúpenie OD26-0001");
    expect(cn).toHaveLength(1);
    expect(cn[0].description).toBe("Odstúpenie OD26-0001");
    expect(cn[0].line_gross_cents).toBe(-12345);
    expect(cn[0].line_net_cents + cn[0].line_vat_cents).toBe(-12345);
  });

  it("splits a partial refund across VAT rates by share", () => {
    const mixed = {
      invoiceNumber: "202600002",
      totalGrossCents: 22000,
      lines: [
        { ...lines[0], vat_rate: 23, line_gross_cents: 12300, line_net_cents: 10000, line_vat_cents: 2300 },
        { ...lines[1], vat_rate: 10, line_gross_cents: 9700, line_net_cents: 8818, line_vat_cents: 882 },
      ],
    };
    const cn = buildCreditNoteLines(mixed, 11000, "Vrátenie");
    expect(cn.map((l) => l.vat_rate)).toEqual([23, 10]);
    expect(cn.reduce((s, l) => s + l.line_gross_cents, 0)).toBe(-11000);
  });

  it("never credits more than the invoice", () => {
    expect(() => buildCreditNoteLines(ref, invoice.total_gross_cents + 1, "x")).toThrow();
    expect(() => buildCreditNoteLines(ref, 0, "x")).toThrow();
  });

  it("dates the credit note to the refund day", () => {
    const { invoice: c } = buildCreditNoteDraft(
      { ...ref, customerSnapshot: invoice.customer_snapshot, paymentMethod: "karta" },
      5000,
      "Odstúpenie OD26-0001",
      "2026-11-20T10:00:00Z",
    );
    expect(c.tax_point_date).toBe("2026-11-20");
    expect(c.total_gross_cents).toBe(-5000);
    expect(c.header_text).toContain("202600001");
  });
});

it("formats the Bratislava day", () => {
  expect(bratislavaIsoDay("2026-07-01T22:30:00Z")).toBe("2026-07-02");
});
