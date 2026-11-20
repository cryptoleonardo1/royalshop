// Brands the shop currently sells (brand slugs). Products of every other brand stay in the database
// but are hidden from the storefront and cannot be ordered. Add a slug back to show its brand again.
// Makita (2026-11-12): Royal stroje is an authorised dealer, machines come from scripts/import-makita.ts.
// NTC, Bomag, Honda, Enar (2026-11-20): supplied by Unicon, prices = Unicon's CZK price lists converted to EUR.
// Atlas Copco stays off (no price list, price on request only).
export const SHOP_BRANDS: readonly string[] = ["golz", "makita", "ntc", "bomag", "honda", "enar"];

export const isShopBrand = (slug: string | null | undefined): boolean => slug != null && SHOP_BRANDS.includes(slug);
