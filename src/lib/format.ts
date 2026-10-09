// Display helpers for catalog data (Slovak formatting). Pure, safe on server and client.

// Lowercase without diacritics — matches products.search_vector (f_unaccent + 'simple').
export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const numberFormatters = new Map<number, Intl.NumberFormat>();
function formatNumber(value: number, decimals: number): string {
  let f = numberFormatters.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat("sk-SK", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    numberFormatters.set(decimals, f);
  }
  return f.format(value);
}

// "1630" + "Nm" → "1 630 Nm", "4.0" + "Ah" → "4,0 Ah"; free text is left alone.
export function formatSpecValue(value: string, unit: string | null): string {
  const trimmed = value.trim();
  const numeric = /^-?\d+(\.\d+)?$/.test(trimmed);
  const text = numeric ? formatNumber(Number(trimmed), trimmed.split(".")[1]?.length ?? 0) : trimmed;
  return unit ? `${text} ${unit}` : text;
}

// Slovak plural for "pracovný deň": 1 deň, 2–4 dni, 5+ dní.
function workDayNoun(n: number): string {
  if (n === 1) return "pracovný deň";
  if (n >= 2 && n <= 4) return "pracovné dni";
  return "pracovných dní";
}

export function workDaysText(min: number, max: number): string {
  if (min === max) return `${min} ${workDayNoun(max)}`;
  return `${min}–${max} ${workDayNoun(max)}`;
}

// Supplier lead time → total business days to the customer (test + repack, then 1 day courier).
export function deliveryDays(lead: { min: number; max: number }, handlingDays: number) {
  return { min: lead.min + handlingDays + 1, max: lead.max + handlingDays + 1 };
}

export const PLATFORM_LABEL: Record<string, string> = {
  LXT_18V: "18V LXT",
  XGT_40V: "40V XGT",
  CXT_12V: "12V CXT",
  none: "Bez batérie",
};

const dayMonth = new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "numeric", timeZone: "Europe/Bratislava" });
const weekdayIndex = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Europe/Bratislava" });
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// nominative ("streda 14. 10.") and accusative after "v" ("v stredu 14. 10.")
const WEEKDAY_NOM = ["nedeľa", "pondelok", "utorok", "streda", "štvrtok", "piatok", "sobota"];
const WEEKDAY_ACC = ["nedeľu", "pondelok", "utorok", "stredu", "štvrtok", "piatok", "sobotu"];

// "štvrtok 15. 10." — Bratislava calendar day regardless of the server time zone.
export function formatDeliveryDate(date: Date, grammaticalCase: "nom" | "acc" = "nom"): string {
  const day = WEEKDAYS.indexOf(weekdayIndex.format(date));
  const names = grammaticalCase === "acc" ? WEEKDAY_ACC : WEEKDAY_NOM;
  return `${names[day]} ${dayMonth.format(date).replace(/\s+/g, " ")}`;
}
