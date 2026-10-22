import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import pricelist from "@/data/honda-engines.json";
import { formatEur, netFromGross, type VatRate } from "@/lib/money";
import { CodeLegend, shaftLabel } from "./honda-engine-codes";
import css from "./shop.module.css";

// Full Honda GX engine price list under the "Motory" category: every variant Honda sells through our
// supplier, not only the five engines we stock. Variants outside the catalog are ordered on request.

interface Engine {
  code: string;
  model: string;
  type: string;
  version: string | null;
  colour: string;
  priceGrossCents: number;
}

const engines = pricelist.engines as Engine[];
const vatRate = pricelist.vatRate as VatRate;

const family = (model: string) => model.match(/^GX\d+/)?.[0] ?? model;
const familyNumber = (f: string) => Number(f.replace(/\D/g, ""));
const dateSk = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${m}. ${y}`;
};

export function HondaEnginePriceList({
  offered,
  email,
  phone,
}: {
  offered: Map<string, string>; // engine code -> product slug of the variants we stock
  email: string | null;
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
        Okrem motorov vyššie vám dodáme ktorýkoľvek typ z oficiálneho cenníka Honda. Ceny sú odporúčané koncové ceny
        s DPH. Motory mimo ponuky objednávame na požiadanie, termín dodania vám potvrdíme
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
                    const slug = offered.get(e.code);
                    const subject = encodeURIComponent(`Dopyt: motor Honda ${e.code}`);
                    return (
                      <tr key={e.code} data-offered={slug ? "" : undefined}>
                        <th scope="row">
                          <span className={css.engineCode}>{e.code}</span>
                          <span className={css.engineShaft}>{shaftLabel(e)}</span>
                        </th>
                        <td>
                          <span className={css.enginePrice}>{formatEur(e.priceGrossCents)}</span>
                          <span className={css.engineNet}>{formatEur(netFromGross(e.priceGrossCents, vatRate))} bez DPH</span>
                        </td>
                        <td>
                          {slug ? (
                            <Link href={`/produkt/${slug}`} className={css.engineAction}>
                              V ponuke <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                          ) : email ? (
                            <a href={`mailto:${email}?subject=${subject}`} className={css.engineAction}>
                              <Mail size={16} aria-hidden="true" /> Dopytovať
                              <span className={css.srOnly}> {e.code}</span>
                            </a>
                          ) : null}
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
