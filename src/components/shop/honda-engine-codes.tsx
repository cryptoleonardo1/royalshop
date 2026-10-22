import css from "./shop.module.css";

// How to read a Honda GX designation such as GX160UT2X-QX-4-OH (model – type – version – colour).
// Only the first letter of the type (the PTO shaft) is documented by Honda (shop manual GX120/160/200 UT2,
// Honda Engines Europe technical sheets); everything else is worded as "usually", because Honda publishes
// no key for it. Research and sources: docs/05-sortiment-stroje.md.

type Family = "GX25" | "GX120" | "GX160" | "GX200" | "GX240" | "GX270" | "GX390" | string;

const family = (model: string): Family => model.match(/^GX\d+/)?.[0] ?? model;
const small = (f: Family) => f === "GX120" || f === "GX160" || f === "GX200";

function shaft(letter: string, f: Family): string | null {
  switch (letter) {
    case "Q":
      if (small(f)) return "hriadeľ s perom Ø 3/4″ (19,05 mm)";
      if (f === "GX390") return "hriadeľ s perom Ø 1″ (25,4 mm)";
      return "hriadeľ s perom, palcový";
    case "S":
      if (f === "GX120") return "hriadeľ s perom Ø 18 mm";
      if (f === "GX160" || f === "GX200") return "hriadeľ s perom Ø 20 mm";
      return "hriadeľ s perom, metrický";
    case "T":
      return "hriadeľ s vonkajším závitom 5/8″";
    case "P":
      return "hriadeľ s vonkajším závitom 3/4″";
    case "V":
      return "kužeľový hriadeľ (elektrocentrály)";
    case "W":
      return "hriadeľ s metrickým závitom (čerpadlá)";
    case "U":
      return "stupňovitý hriadeľ so závitom 1/2″";
    case "H":
      return "prevodovka 1 : 6, výstup s perom";
    case "L":
      return "reťazová redukcia 1 : 2";
    case "R":
      return "reťazová redukcia 1 : 2 so spojkou";
    default:
      return null;
  }
}

const COLOUR: Record<string, string> = { OH: "červený", SD: "čierny" };

// One short line under each engine code in the price list.
export function shaftLabel(e: { model: string; type: string; colour: string }): string {
  const f = family(e.model);
  const parts = [f === "GX25" ? "prevedenie podľa typového štítku" : (shaft(e.type[0], f) ?? "prevedenie podľa typového štítku")];
  if (COLOUR[e.colour]) parts.push(COLOUR[e.colour]);
  return parts.join(" · ");
}

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
