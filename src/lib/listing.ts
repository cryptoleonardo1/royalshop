import type { BatteryPlatform, ProductSummary } from "./catalog";
import { deliveryDays, formatSpecValue, PLATFORM_LABEL } from "./format";
import { discountPct } from "./pricing";

// Category / listing filters driven by URL search params (shareable, work without JS).
// Facet counts are computed per group with every *other* group applied, so an option shows
// how many products you would get by ticking it.

export type SearchParams = Record<string, string | string[] | undefined>;

export const SORTS = [
  { value: "odporucane", label: "Odporúčané" },
  { value: "cena-asc", label: "Od najlacnejších" },
  { value: "cena-desc", label: "Od najdrahších" },
  { value: "zlava", label: "Najväčšia zľava" },
  { value: "nazov", label: "Podľa názvu" },
] as const;
export type Sort = (typeof SORTS)[number]["value"];

export const PAGE_SIZE = 24;

const PLATFORM_SLUG: Record<BatteryPlatform, string> = {
  LXT_18V: "lxt",
  XGT_40V: "xgt",
  CXT_12V: "cxt",
  none: "siet",
};
const SPEC_PREFIX = "p_";

export interface Filters {
  brands: string[];
  platforms: string[];
  kit: "sada" | "solo" | null;
  sale: boolean;
  priceMin: number | null; // EUR
  priceMax: number | null; // EUR
  deliveryMax: number | null; // business days
  specs: Record<string, string[]>;
  sort: Sort;
  page: number;
}

const list = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v : v ? [v] : [])
    .flatMap((s) => s.split(","))
    .map((s) => s.trim())
    .filter(Boolean);
const first = (v: string | string[] | undefined) => list(v)[0];
const positiveInt = (v: string | undefined) => {
  const n = v ? Number.parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function parseFilters(sp: SearchParams): Filters {
  const kit = first(sp.vybava);
  const sort = first(sp.zoradit);
  const specs: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key.startsWith(SPEC_PREFIX) && key.length > SPEC_PREFIX.length) {
      const values = list(value);
      if (values.length) specs[key.slice(SPEC_PREFIX.length)] = values;
    }
  }
  return {
    brands: list(sp.znacka),
    platforms: list(sp.platforma),
    kit: kit === "sada" || kit === "solo" ? kit : null,
    sale: first(sp.akcia) === "1",
    priceMin: positiveInt(first(sp.cena_od)),
    priceMax: positiveInt(first(sp.cena_do)),
    deliveryMax: positiveInt(first(sp.dodanie)),
    specs,
    sort: SORTS.some((s) => s.value === sort) ? (sort as Sort) : "odporucane",
    page: Math.max(1, positiveInt(first(sp.strana)) ?? 1),
  };
}

type Group = "brand" | "platform" | "kit" | "sale" | "price" | "delivery" | `spec:${string}`;

function matches(p: ProductSummary, f: Filters, handlingDays: number, skip?: Group): boolean {
  if (skip !== "brand" && f.brands.length && !f.brands.includes(p.brand.slug)) return false;
  if (skip !== "platform" && f.platforms.length && !f.platforms.includes(PLATFORM_SLUG[p.batteryPlatform]))
    return false;
  if (skip !== "kit" && f.kit && (f.kit === "sada") !== p.isKit) return false;
  if (skip !== "sale" && f.sale && discountPct(p) === 0) return false;
  if (skip !== "price") {
    if (f.priceMin != null && p.priceGrossCents < f.priceMin * 100) return false;
    if (f.priceMax != null && p.priceGrossCents > f.priceMax * 100) return false;
  }
  if (skip !== "delivery" && f.deliveryMax != null && deliveryDays(p.leadDays, handlingDays).max > f.deliveryMax) {
    return false;
  }
  for (const [key, values] of Object.entries(f.specs)) {
    if (skip === `spec:${key}`) continue;
    const spec = p.specs.find((s) => s.key === key);
    if (!spec || !values.includes(spec.value)) return false;
  }
  return true;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
  checked: boolean;
}
export interface Facet {
  param: string; // search param name
  label: string;
  type: "checkbox" | "radio";
  options: FacetOption[];
}

export interface Listing {
  filters: Filters;
  facets: Facet[];
  price: { min: number; max: number }; // EUR bounds of the unfiltered set
  total: number;
  pageCount: number;
  items: ProductSummary[];
  activeCount: number;
}

const MAX_SPEC_OPTIONS = 8;

export function buildListing(products: ProductSummary[], sp: SearchParams, handlingDays: number): Listing {
  const f = parseFilters(sp);
  const pool = (skip: Group) => products.filter((p) => matches(p, f, handlingDays, skip));
  const facets: Facet[] = [];

  const optionCounts = <T extends string>(items: ProductSummary[], key: (p: ProductSummary) => T | null) => {
    const counts = new Map<T, number>();
    items.forEach((p) => {
      const k = key(p);
      if (k != null) counts.set(k, (counts.get(k) ?? 0) + 1);
    });
    return counts;
  };

  // Brand
  const brandNames = new Map(products.map((p) => [p.brand.slug, p.brand.name]));
  if (brandNames.size > 1) {
    const counts = optionCounts(pool("brand"), (p) => p.brand.slug);
    facets.push({
      param: "znacka",
      label: "Značka",
      type: "checkbox",
      options: [...brandNames].map(([value, label]) => ({
        value,
        label,
        count: counts.get(value) ?? 0,
        checked: f.brands.includes(value),
      })),
    });
  }

  // Battery platform
  const platforms = new Set(products.map((p) => p.batteryPlatform));
  if (platforms.size > 1) {
    const counts = optionCounts(pool("platform"), (p) => PLATFORM_SLUG[p.batteryPlatform]);
    const order: BatteryPlatform[] = ["LXT_18V", "XGT_40V", "CXT_12V", "none"];
    facets.push({
      param: "platforma",
      label: "Batériová platforma",
      type: "checkbox",
      options: order
        .filter((pl) => platforms.has(pl))
        .map((pl) => ({
          value: PLATFORM_SLUG[pl],
          label: pl === "none" ? "Sieťové a motorové" : PLATFORM_LABEL[pl],
          count: counts.get(PLATFORM_SLUG[pl]) ?? 0,
          checked: f.platforms.includes(PLATFORM_SLUG[pl]),
        })),
    });
  }

  // Kit vs. solo (only meaningful for cordless tools)
  const cordless = products.filter((p) => p.batteryPlatform !== "none");
  if (cordless.some((p) => p.isKit) && cordless.some((p) => !p.isKit)) {
    const counts = optionCounts(pool("kit"), (p) => (p.batteryPlatform === "none" ? null : p.isKit ? "sada" : "solo"));
    facets.push({
      param: "vybava",
      label: "Výbava",
      type: "radio",
      options: [
        { value: "sada", label: "Sada s batériami", count: counts.get("sada") ?? 0, checked: f.kit === "sada" },
        { value: "solo", label: "Bez batérií (solo)", count: counts.get("solo") ?? 0, checked: f.kit === "solo" },
      ],
    });
  }

  // Delivery time
  const deliveryMaxes = [...new Set(products.map((p) => deliveryDays(p.leadDays, handlingDays).max))].sort(
    (a, b) => a - b,
  );
  if (deliveryMaxes.length > 1) {
    const deliveryPool = pool("delivery");
    facets.push({
      param: "dodanie",
      label: "Dodanie",
      type: "radio",
      options: deliveryMaxes.slice(0, -1).map((days) => ({
        value: String(days),
        label: days === 1 ? "Do 1 pracovného dňa" : `Do ${days} pracovných dní`,
        count: deliveryPool.filter((p) => deliveryDays(p.leadDays, handlingDays).max <= days).length,
        checked: f.deliveryMax === days,
      })),
    });
  }

  // Sale
  if (products.some((p) => discountPct(p) > 0)) {
    const count = pool("sale").filter((p) => discountPct(p) > 0).length;
    facets.push({
      param: "akcia",
      label: "Akcia",
      type: "checkbox",
      options: [{ value: "1", label: "Len zľavnené", count, checked: f.sale }],
    });
  }

  // Filterable technical parameters with a small set of distinct values in this listing
  const specKeys = new Map<string, { label: string; unit: string | null; values: Set<string>; seen: number }>();
  products.forEach((p) =>
    p.specs
      .filter((s) => s.isFilterable)
      .forEach((s) => {
        const entry = specKeys.get(s.key) ?? { label: s.label, unit: s.unit, values: new Set<string>(), seen: 0 };
        entry.values.add(s.value);
        entry.seen++;
        specKeys.set(s.key, entry);
      }),
  );
  for (const [key, entry] of specKeys) {
    const isFlag = entry.values.size === 1 && entry.seen < products.length; // e.g. "Bezuhlíkový motor: áno"
    if (entry.seen < 2 || entry.values.size > MAX_SPEC_OPTIONS || (entry.values.size < 2 && !isFlag)) continue;
    const counts = optionCounts(pool(`spec:${key}`), (p) => p.specs.find((s) => s.key === key)?.value ?? null);
    const selected = f.specs[key] ?? [];
    const values = [...entry.values].sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      return Number.isFinite(na) && Number.isFinite(nb) ? na - nb : a.localeCompare(b, "sk");
    });
    facets.push({
      param: SPEC_PREFIX + key,
      label: stripParens(entry.label),
      type: "checkbox",
      options: values.map((value) => ({
        value,
        label: formatSpecValue(value, entry.unit),
        count: counts.get(value) ?? 0,
        checked: selected.includes(value),
      })),
    });
  }

  const filtered = products.filter((p) => matches(p, f, handlingDays));
  const sorted = sortProducts(filtered, f.sort);
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(f.page, pageCount);
  const prices = products.map((p) => p.priceGrossCents);

  const activeCount =
    f.brands.length +
    f.platforms.length +
    (f.kit ? 1 : 0) +
    (f.sale ? 1 : 0) +
    (f.priceMin != null || f.priceMax != null ? 1 : 0) +
    (f.deliveryMax != null ? 1 : 0) +
    Object.values(f.specs).reduce((s, v) => s + v.length, 0);

  return {
    filters: { ...f, page },
    facets,
    price: {
      min: prices.length ? Math.floor(Math.min(...prices) / 100) : 0,
      max: prices.length ? Math.ceil(Math.max(...prices) / 100) : 0,
    },
    total: sorted.length,
    pageCount,
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    activeCount,
  };
}

// "Hmotnosť (EPTA)" → "Hmotnosť" so differently labelled weights read as one filter.
function stripParens(label: string): string {
  return label.replace(/\s*\([^)]*\)\s*$/, "");
}

function sortProducts(items: ProductSummary[], sort: Sort): ProductSummary[] {
  const out = [...items];
  switch (sort) {
    case "cena-asc":
      return out.sort((a, b) => a.priceGrossCents - b.priceGrossCents);
    case "cena-desc":
      return out.sort((a, b) => b.priceGrossCents - a.priceGrossCents);
    case "zlava":
      return out.sort((a, b) => discountPct(b) - discountPct(a) || a.priceGrossCents - b.priceGrossCents);
    case "nazov":
      return out.sort((a, b) => a.name.localeCompare(b.name, "sk"));
    default:
      // featured first, then products with photos, then by name
      return out.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          Number(!!b.image) - Number(!!a.image) ||
          a.name.localeCompare(b.name, "sk"),
      );
  }
}

// Builds a listing URL from the current params with some keys replaced (null removes the key).
export function listingHref(basePath: string, sp: SearchParams, changes: Record<string, string | null>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (key in changes) continue;
    list(value).forEach((v) => params.append(key, v));
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value != null) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// Drops one value of a multi-value param, or whole params, and resets paging ("remove filter" chips).
export function listingHrefWithout(
  basePath: string,
  sp: SearchParams,
  param: string | string[],
  value?: string,
): string {
  const drop = Array.isArray(param) ? param : [param];
  const params = new URLSearchParams();
  for (const [key, v] of Object.entries(sp)) {
    if (key === "strana") continue;
    list(v).forEach((item) => {
      if (drop.includes(key) && (value === undefined || item === value)) return;
      params.append(key, item);
    });
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
