// Brands the shop currently sells (brand slugs). Products of every other brand stay in the database
// but are hidden from the storefront and cannot be ordered. Add a slug back to show its brand again.
// Honda is off until Honda confirms the dealership (2026-11-07); Gölz FS125/FS170 still carry Honda engines.
// Makita (2026-11-12): Royal stroje is an authorised dealer, machines come from scripts/import-makita.ts.
export const SHOP_BRANDS: readonly string[] = ["golz", "makita"];

export const isShopBrand = (slug: string | null | undefined): boolean => slug != null && SHOP_BRANDS.includes(slug);
