import css from "./shop.module.css";

// Legend for the engine codes; the per-row shaft text lives in src/lib/honda-engines.ts.

const SHAFTS: [string, string][] = [
  ["Q", "valcový hriadeľ s perom, palcový (GX120–200 Ø 3/4″, GX390 Ø 1″)"],
  ["S", "valcový hriadeľ s perom, metrický (GX120 Ø 18 mm, GX160/200 Ø 20 mm)"],
  ["T", "hriadeľ s vonkajším závitom 5/8″"],
  ["P", "hriadeľ s vonkajším závitom 3/4″"],
  ["V", "kužeľový hriadeľ, typicky pre elektrocentrály"],
  ["W", "hriadeľ s metrickým závitom, typicky pre čerpadlá"],
  ["U", "stupňovitý hriadeľ so závitom 1/2″"],
  ["H", "prevodovka 1 : 6 (pomalý výstup s perom)"],
  ["L", "reťazová redukcia 1 : 2"],
  ["R", "reťazová redukcia 1 : 2 s odstredivou spojkou"],
];

export function CodeLegend() {
  return (
    <details className={css.engineLegend}>
      <summary>Ako čítať kód motora</summary>
      <div className={css.engineLegendBody}>
        <p className={css.engineExample} aria-label="Príklad kódu GX160UT2X-QX-4-OH">
          <span>
            <strong>GX160UT2X</strong>
            <small>model</small>
          </span>
          <span>
            <strong>QX</strong>
            <small>typ</small>
          </span>
          <span>
            <strong>4</strong>
            <small>verzia</small>
          </span>
          <span>
            <strong>OH</strong>
            <small>farba</small>
          </span>
        </p>
        <dl className={css.engineLegendList}>
          <div>
            <dt>Model</dt>
            <dd>
              Číslo za GX je objem motora v cm³ (GX160 = 163 cm³). Písmená a číslice za ním označujú výrobnú sériu,
              zvyčajne aj závod: T – Thajsko, H – Čína. Výkon je pri rovnakom objeme rovnaký, rozmery a uchytenie sa
              medzi sériami môžu mierne líšiť.
            </dd>
          </div>
          <div>
            <dt>Typ – prvé písmeno: hriadeľ</dt>
            <dd>
              Rozhoduje, či motor pasuje na váš stroj.
              <ul className={css.engineShaftList}>
                {SHAFTS.map(([letter, text]) => (
                  <li key={letter}>
                    <strong>{letter}</strong> {text}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Typ – druhé písmeno: výbava</dt>
            <dd>
              Kombinácia výbavy od výrobcu. Zvyčajne platí: <strong>X</strong> = s olejovým snímačom (motor sa pri
              nízkej hladine oleja vypne), <strong>H</strong> = bez olejového snímača. Ostatné písmená sú výbavy pre
              konkrétnych výrobcov strojov.
            </dd>
          </div>
          <div>
            <dt>Verzia</dt>
            <dd>
              Presná zostava (vzduchový filter, tlmič, ovládanie plynu, štartovanie). Verzia začínajúca písmenom{" "}
              <strong>E</strong> má zvyčajne elektrický štart.
            </dd>
          </div>
          <div>
            <dt>Farba</dt>
            <dd>
              <strong>OH</strong> červená (štandard Honda), <strong>SD</strong> čierna.
            </dd>
          </div>
        </dl>
        <p className={css.engineLegendTip}>
          Najistejšie je porovnať kód s typovým štítkom na starom motore (typ je vyrazený vedľa výrobného čísla).
          Pošlite nám fotku štítku a vyberieme správny motor.
        </p>
      </div>
    </details>
  );
}
