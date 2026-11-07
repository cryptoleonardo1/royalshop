// Accessories (blades, pads, ...) are not machines: no test run before dispatch, no "stroj" wording,
// and on a machine page they are offered as add-ons (related_products type 'accessory').
export const BLADE_CATEGORY = "diamantove-kotuce";
const ACCESSORY_CATEGORIES = new Set([BLADE_CATEGORY, "prislusenstvo"]);

export const isAccessory = (p: { category: { slug: string } }): boolean => ACCESSORY_CATEGORIES.has(p.category.slug);
