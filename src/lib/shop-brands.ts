// Brands the shop does NOT sell right now (brand slugs). Their products stay in the database but are hidden
// from the storefront and cannot be ordered. Remove a slug to show its brand again.
// A deny list since 2026-11-24: the AG náradie feed brings dozens of brands (scripts/import-ag.ts), so every
// brand is shown unless it is listed here.
// Gölz (2026-11-24, founder decision): hidden until the legal duties of a direct import from Germany are
// settled (packaging and electrical-equipment producer registration).
// Atlas Copco stays off (no price list, price on request only).
// Bosch and Milwaukee (both from the AG náradie feed): hidden on 2026-11-27, founder decision.
// Small brands (2026-11-27, founder): every brand with 3 or fewer listed products on that day (39 products,
// all from the AG feed). A fixed list, not a live rule, so a brand does not blink in and out with AG stock.
const SMALL_BRANDS = [
  "2m2-group", "bradas", "cerva", "dewalt", "hazet", "kukko", "metalkov", "meva", "profiair", "saalet", "scangrip",
  "bgs", "daihen", "facom", "fervi", "horizont", "metabo", "mikov", "spokar", "tunali-wheelbarows", "workers-best",
  "ziipa", "festa-westberg", "festool",
];
export const HIDDEN_BRANDS: readonly string[] = ["golz", "atlas-copco", "bosch", "milwaukee", ...SMALL_BRANDS];

export const isShopBrand = (slug: string | null | undefined): boolean => slug != null && !HIDDEN_BRANDS.includes(slug);
