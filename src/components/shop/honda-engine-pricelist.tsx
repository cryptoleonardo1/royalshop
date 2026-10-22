import Link from "next/link";
import { formatEur, netFromGross } from "@/lib/money";
import {
  family,
  hondaEngineName,
  hondaEngineSlug,
  hondaEngines as engines,
  hondaPriceList as pricelist,
  hondaVatRate as vatRate,
  shaftLabel,
} from "@/lib/honda-engines";
import { EngineAddButton } from "./cart-buttons";
import { CodeLegend } from "./honda-engine-codes";
import css from "./shop.module.css";

// Full Honda GX engine price list under the "Motory" category: every variant Honda sells through our
// supplier, not only the five engines we stock. Every row can go to the cart: stocked variants are
// catalog products, the rest are unlisted products seeded from the same price list.

export interface OfferedEngine {
  slug: string;
  name: string;
  image: string | null;
}

const familyNumber = (f: string) => Number(f.replace(/\D/g, ""));
const dateSk = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${m}. ${y}`;
};

export function HondaEnginePriceList({
  offered,
  phone,
}: {
  offered: Map<string, OfferedEngine>; // engine code -> catalog product of the variants we stock
  phone: string | null;
}) {
  const families = [...Map.groupBy(engines, (e) => family(e.model))].sort(
    ([a], [b]) => familyNumber(a) - familyNumber(b),
  );

  return (
    <section className={css.enginePrices} aria-labelledby="engine-prices-title">
      <div className={css.sectionHead}>
        <span className={css.tape}>Cenník Honda · platí do {dateSk(pricelist.validTo)}</span>
        <h2 id="engine-prices-title" className={css.h2}>
          Všetky motory Honda GX <span>aj tie mimo ponuky</span>
        </h2>
      </div>
      <p className={css.engineLede}>
        Okrem motorov vyššie vám dodáme ktorýkoľvek typ z oficiálneho cenníka Honda a objednáte ho priamo cez košík.
        Ceny sú odporúčané koncové ceny s DPH. Motory mimo ponuky objednávame u dodávateľa, termín dodania vám potvrdíme
        {phone ? (
          <>
            {" "}
            e-mailom alebo na <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
          </>
        ) : (
          " e-mailom"
        )}
        . Neviete, ktorý typ potrebujete? Pošlite nám typový štítok zo starého motora.
      </p>

      <CodeLegend />

      <div className={css.engineFamilies}>
        {families.map(([name, items]) => {
          const from = Math.min(...items.map((e) => e.priceGrossCents));
          return (
            <details key={name} className={css.engineFamily}>
              <summary>
                <span className={css.engineFamilyName}>{name}</span>
                <span className={css.engineFamilyMeta}>
                  {items.length} {items.length === 1 ? "typ" : items.length < 5 ? "typy" : "typov"} · od {formatEur(from)}
                </span>
              </summary>
              <table className={css.engineTable}>
                <caption className={css.srOnly}>Motory Honda {name}: typ, prevedenie a cena</caption>
                <thead>
                  <tr>
                    <th scope="col">Typ motora</th>
                    <th scope="col">Cena s DPH</th>
                    <th scope="col">
                      <span className={css.srOnly}>Objednanie</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => {
                    const stocked = offered.get(e.code);
                    const slug = stocked?.slug ?? hondaEngineSlug(e.code);
                    return (
                      <tr key={e.code}>
                        <th scope="row">
                          <Link href={`/produkt/${slug}`} className={`${css.engineCode} ${css.engineCodeLink}`}>
                            {e.code}
                          </Link>
                          <span className={css.engineShaft}>{shaftLabel(e)}</span>
                        </th>
                        <td>
                          <span className={css.enginePrice}>{formatEur(e.priceGrossCents)}</span>
                          <span className={css.engineNet}>{formatEur(netFromGross(e.priceGrossCents, vatRate))} bez DPH</span>
                        </td>
                        <td>
                          <EngineAddButton
                            item={{
                              slug,
                              name: stocked?.name ?? hondaEngineName(e.code),
                              sku: e.code,
                              priceGrossCents: e.priceGrossCents,
                              image: stocked?.image ?? null,
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </details>
          );
        })}
      </div>
      <p className={css.engineNote}>
        Ceny podľa cenníka motorov Honda platného od {dateSk(pricelist.validFrom)} do {dateSk(pricelist.validTo)}. Pred
        prvým štartom naplňte motor olejom podľa návodu.
      </p>
    </section>
  );
}
