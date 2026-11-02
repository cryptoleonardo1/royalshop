// Brands the shop currently sells (brand slugs). Products of every other brand stay in the database
// but are hidden from the storefront and cannot be ordered. Add a slug back to show its brand again.
export const SHOP_BRANDS: readonly string[] = ["golz", "honda"];

export const isShopBrand = (slug: string | null | undefined): boolean => slug != null && SHOP_BRANDS.includes(slug);
