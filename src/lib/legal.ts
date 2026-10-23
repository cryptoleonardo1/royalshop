// Legal pages (VOP, reklamačný poriadok, odstúpenie, doprava a platba, GDPR, cookies) live in code, so git is
// their archive. Bump LEGAL_VERSION whenever the wording changes: every order stores the version it accepted.
// Research and sources: docs/06-pravne-stranky.md.

export const LEGAL_VERSION = "2026-10-23";
export const LEGAL_VALID_FROM = "23. 10. 2026";

// Binding delivery promise (docs/06 §1.2): "zvyčajne X, najneskôr do 10 pracovných dní od zaplatenia".
// SOI treats the upper bound as binding, so keep it realistic.
export const DELIVERY_MAX_WORKDAYS = 10;

// Days to refund when we cannot accept an order (goods unavailable) — our own VOP commitment.
export const UNAVAILABLE_REFUND_WORKDAYS = 2;

// Estimated direct cost of returning a machine after withdrawal, by our delivery band (maxKg null =
// heaviest). Shown before the order (§ 15 ods. 1 písm. g) ZOS); placeholders until the carrier's price list.
export const RETURN_COST_ESTIMATES: { maxKg: number | null; label: string; maxCents: number }[] = [
  { maxKg: 40, label: "do 40 kg (balík)", maxCents: 2000 },
  { maxKg: 100, label: "do 100 kg", maxCents: 7000 },
  { maxKg: 300, label: "do 300 kg", maxCents: 12000 },
  { maxKg: null, label: "nad 300 kg", maxCents: 20000 },
];

// "Zapísaná v Obchodnom registri…" from settings, continued mid-sentence after a comma.
export const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

export function returnCostEstimate(weightKg: number | null) {
  const last = RETURN_COST_ESTIMATES[RETURN_COST_ESTIMATES.length - 1];
  if (weightKg == null) return last;
  return RETURN_COST_ESTIMATES.find((r) => r.maxKg == null || weightKg <= r.maxKg) ?? last;
}

// Supervisory and ADR body for consumer disputes (residual ARS subject, § 3 ods. 2 písm. c) z. 391/2015).
export const SOI = {
  name: "Slovenská obchodná inšpekcia, Inšpektorát SOI pre Bratislavský kraj",
  address: "Bajkalská 21/A, P. O. BOX 5, 820 07 Bratislava",
  web: "https://www.soi.sk",
  arsListUrl: "https://www.mhsr.sk/obchod/ochrana-spotrebitela/alternativne-riesenie-spotrebitelskych-sporov-1/zoznam-subjektov-alternativneho-riesenia-spotrebitelskych-sporov-1",
};

export const UOOU = {
  name: "Úrad na ochranu osobných údajov Slovenskej republiky",
  address: "Galvaniho 7/B, 821 04 Bratislava",
  web: "https://dataprotection.gov.sk",
};

export const LEGAL_PAGES = [
  { href: "/obchodne-podmienky", label: "Obchodné podmienky" },
  { href: "/reklamacny-poriadok", label: "Reklamačný poriadok" },
  { href: "/odstupenie-od-zmluvy", label: "Odstúpenie od zmluvy" },
  { href: "/doprava-a-platba", label: "Doprava a platba" },
  { href: "/ochrana-osobnych-udajov", label: "Ochrana osobných údajov" },
  { href: "/cookies", label: "Cookies" },
] as const;
