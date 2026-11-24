// Brands the shop does NOT sell right now (brand slugs). Their products stay in the database but are hidden
// from the storefront and cannot be ordered. Remove a slug to show its brand again.
// A deny list since 2026-11-24: the AG náradie feed brings dozens of brands (scripts/import-ag.ts), so every
// brand is shown unless it is listed here.
// Gölz (2026-11-24, founder decision): hidden until the legal duties of a direct import from Germany are
// settled (packaging and electrical-equipment producer registration).
// Atlas Copco stays off (no price list, price on request only).
export const HIDDEN_BRANDS: readonly string[] = ["golz", "atlas-copco"];

export const isShopBrand = (slug: string | null | undefined): boolean => slug != null && !HIDDEN_BRANDS.includes(slug);
