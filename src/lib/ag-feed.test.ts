import { describe, expect, it } from "vitest";
import { AG_MIN_PRICE_CENTS, agGrossCents, agOffer, parseAgPriceFeed } from "./ag-feed";

describe("AG náradie feed rules", () => {
  it("adds VAT to the three-decimal feed price and rounds to cents", () => {
    expect(agGrossCents(1.425)).toBe(175); // 1.75275
    expect(agGrossCents(40.65)).toBe(5000); // 49.9995
    expect(agGrossCents(126.428)).toBe(15551);
    expect(agGrossCents(0)).toBe(0);
  });

  it("lists a product only when it is in stock and not below the minimum price", () => {
    expect(AG_MIN_PRICE_CENTS).toBe(5000);
    expect(agOffer(53.6, 2)).toEqual({ priceGrossCents: 6593, inStock: true, isListed: true });
    expect(agOffer(53.6, 0)).toEqual({ priceGrossCents: 6593, inStock: false, isListed: false });
    expect(agOffer(40.64, 5)).toEqual({ priceGrossCents: 4999, inStock: true, isListed: false });
    expect(agOffer(0, 5).inStock).toBe(false);
  });

  it("reads codes, stock and prices from the price feed", () => {
    const feed = parseAgPriceFeed(`<?xml version="1.0"?><Cennik><Datum>26-11-19T18:08:31+01:00</Datum><Tovary>
      <Produkt><IntKod>0320500</IntKod><SKID>28</SKID><Nazov><![CDATA[Kľúč <895>]]></Nazov><EAN/><Zasoba>8</Zasoba><CenaBezDPH>1.425</CenaBezDPH></Produkt>
      <Produkt><IntKod>0320502</IntKod><Zasoba>0</Zasoba><CenaBezDPH>2.385</CenaBezDPH></Produkt>
      <Produkt><IntKod>0320503</IntKod><Zasoba/><CenaBezDPH>2.385</CenaBezDPH></Produkt>
    </Tovary></Cennik>`);
    expect(feed.exportedAt).toBe("26-11-19T18:08:31+01:00");
    expect([...feed.rows]).toEqual([
      ["0320500", { netEur: 1.425, stock: 8 }],
      ["0320502", { netEur: 2.385, stock: 0 }],
    ]);
  });
});
