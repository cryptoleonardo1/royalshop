import { describe, expect, it } from "vitest";
import type { ProductSummary } from "./catalog";
import { deliveryDays, foldText, formatDeliveryDate, formatSpecValue, workDaysText } from "./format";
import { buildListing, listingHref, listingHrefWithout, parseFilters } from "./listing";
import { discountPct, referencePrice } from "./pricing";

function product(over: Partial<ProductSummary> & { slug: string }): ProductSummary {
  return {
    id: over.slug,
    name: over.slug,
    sku: null,
    priceGrossCents: 10000,
    compareAtPriceCents: null,
    priceOnRequest: false,
    lowestPrice30dCents: null,
    vatRate: 23,
    batteryPlatform: "none",
    isKit: false,
    shippingClass: "courier",
    isFeatured: false,
    createdAt: "2026-10-01",
    brand: { slug: "makita", name: "Makita" },
    category: { slug: "kladiva", name: "Kladivá" },
    leadDays: { min: 2, max: 2 },
    image: null,
    specs: [],
    ...over,
  };
}

const products = [
  product({
    slug: "a",
    batteryPlatform: "LXT_18V",
    isKit: true,
    priceGrossCents: 50000,
    specs: [{ key: "voltage", label: "Napätie", value: "18", unit: "V", isFilterable: true }],
  }),
  product({
    slug: "b",
    batteryPlatform: "XGT_40V",
    priceGrossCents: 80000,
    compareAtPriceCents: 90000,
    lowestPrice30dCents: 90000,
    specs: [{ key: "voltage", label: "Napätie", value: "40", unit: "V", isFilterable: true }],
  }),
  product({
    slug: "c",
    brand: { slug: "ntc", name: "NTC" },
    priceGrossCents: 400000,
    leadDays: { min: 3, max: 5 },
    shippingClass: "own_transport",
  }),
];

describe("pricing (Omnibus)", () => {
  it("measures the discount from the lowest 30-day price, not compare_at", () => {
    const p = { priceGrossCents: 8000, compareAtPriceCents: 12000, lowestPrice30dCents: 10000 };
    expect(referencePrice(p)).toBe(10000);
    expect(discountPct(p)).toBe(20);
  });

  it("shows no discount when the 30-day low is not above the current price", () => {
    expect(discountPct({ priceGrossCents: 8000, compareAtPriceCents: 12000, lowestPrice30dCents: 8000 })).toBe(0);
    expect(discountPct({ priceGrossCents: 8000, compareAtPriceCents: null, lowestPrice30dCents: 9000 })).toBe(0);
  });

  it("falls back to compare_at without price history", () => {
    expect(discountPct({ priceGrossCents: 9000, compareAtPriceCents: 10000, lowestPrice30dCents: null })).toBe(10);
  });
});

describe("format", () => {
  it("folds diacritics for search", () => {
    expect(foldText("Vibračná DOSKA")).toBe("vibracna doska");
  });

  it("formats spec numbers the Slovak way", () => {
    expect(formatSpecValue("1630", "Nm").replace(/\s/g, " ")).toBe("1 630 Nm");
    expect(formatSpecValue("4.0", "Ah")).toBe("4,0 Ah");
    expect(formatSpecValue("SDS-max", null)).toBe("SDS-max");
  });

  it("uses the right plural for business days", () => {
    expect(workDaysText(4, 4)).toBe("4 pracovné dni");
    expect(workDaysText(5, 7)).toBe("5–7 pracovných dní");
    expect(workDaysText(1, 1)).toBe("1 pracovný deň");
  });

  it("adds handling and courier day to supplier lead time", () => {
    expect(deliveryDays({ min: 2, max: 2 }, 1)).toEqual({ min: 4, max: 4 });
  });

  it("formats weekdays in nominative and accusative", () => {
    const wednesday = new Date("2026-10-14T10:00:00Z");
    expect(formatDeliveryDate(wednesday).replace(/\s/g, " ")).toBe("streda 14. 10.");
    expect(formatDeliveryDate(wednesday, "acc").replace(/\s/g, " ")).toBe("stredu 14. 10.");
  });
});

describe("listing", () => {
  it("parses filters defensively", () => {
    const f = parseFilters({
      znacka: ["makita", "ntc"],
      zoradit: "zle",
      strana: "-3",
      cena_od: "abc",
      p_voltage: "18,40",
    });
    expect(f.brands).toEqual(["makita", "ntc"]);
    expect(f.sort).toBe("odporucane");
    expect(f.page).toBe(1);
    expect(f.priceMin).toBeNull();
    expect(f.specs.voltage).toEqual(["18", "40"]);
  });

  it("filters by platform, price and sale", () => {
    expect(buildListing(products, { platforma: "xgt" }, 1).items.map((p) => p.slug)).toEqual(["b"]);
    expect(buildListing(products, { cena_do: "1000" }, 1).total).toBe(2);
    expect(buildListing(products, { akcia: "1" }, 1).items.map((p) => p.slug)).toEqual(["b"]);
  });

  it("filters by delivery time", () => {
    expect(
      buildListing(products, { dodanie: "4" }, 1)
        .items.map((p) => p.slug)
        .sort(),
    ).toEqual(["a", "b"]);
  });

  it("counts facet options against the other active filters", () => {
    const listing = buildListing(products, { znacka: "makita" }, 1);
    const brand = listing.facets.find((f) => f.param === "znacka")!;
    // the brand group ignores its own selection, so NTC still shows its count
    expect(brand.options.find((o) => o.value === "ntc")?.count).toBe(1);
    const platform = listing.facets.find((f) => f.param === "platforma")!;
    expect(platform.options.find((o) => o.value === "siet")?.count).toBe(0);
  });

  it("sorts by price", () => {
    expect(buildListing(products, { zoradit: "cena-desc" }, 1).items.map((p) => p.slug)).toEqual(["c", "b", "a"]);
  });

  it("keeps price-on-request products out of price filters and last in price sorts", () => {
    const withAsk = [...products, product({ slug: "d", priceGrossCents: 100, priceOnRequest: true })];
    expect(buildListing(withAsk, { zoradit: "cena-asc" }, 1).items.map((p) => p.slug)).toEqual(["a", "b", "c", "d"]);
    expect(buildListing(withAsk, { zoradit: "cena-desc" }, 1).items.map((p) => p.slug)).toEqual(["c", "b", "a", "d"]);
    expect(buildListing(withAsk, { cena_do: "1000" }, 1).items.map((p) => p.slug)).toEqual(["a", "b"]);
    expect(buildListing(withAsk, {}, 1).price).toEqual({ min: 500, max: 4000 });
  });

  it("builds and strips filter URLs", () => {
    const sp = { znacka: ["makita", "ntc"], strana: "2" };
    expect(listingHrefWithout("/produkty", sp, "znacka", "ntc")).toBe("/produkty?znacka=makita");
    expect(listingHref("/produkty", sp, { strana: null, zoradit: "nazov" })).toBe(
      "/produkty?znacka=makita&znacka=ntc&zoradit=nazov",
    );
  });
});
