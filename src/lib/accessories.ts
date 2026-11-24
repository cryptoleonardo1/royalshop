// Accessories (blades, pads, ...) are not machines: no test run before dispatch, no "stroj" wording,
// and on a machine page they are offered as add-ons (related_products type 'accessory').
export const BLADE_CATEGORY = "diamantove-kotuce";
const ACCESSORY_CATEGORIES = new Set([BLADE_CATEGORY, "prislusenstvo"]);

export const isAccessory = (p: { category: { slug: string } }): boolean => ACCESSORY_CATEGORIES.has(p.category.slug);

// Only the construction machines of these brands are started and checked before dispatch. Everything else
// (Makita, the AG náradie range) is sold as sealed boxed goods and carries no "otestované" promise.
const TESTED_BRANDS = new Set(["golz", "ntc", "bomag", "honda", "enar", "atlas-copco"]);

export const isTestedBeforeDispatch = (p: { category: { slug: string }; brand: { slug: string } }): boolean =>
  !isAccessory(p) && TESTED_BRANDS.has(p.brand.slug);

// Blades that fit one machine (related_products type 'accessory'), for the cart reminder.
export interface MachineBlades<T extends { slug: string }> {
  slug: string;
  name: string;
  // the machine ships with a blade (spec blade_included = "áno …"), so it cuts out of the box
  bladeIncluded: boolean;
  blades: T[];
}

export const bladeIncluded = (specs: { key: string; value: string }[]): boolean =>
  specs.find((s) => s.key === "blade_included")?.value.startsWith("áno") ?? false;

// Machines in the cart that cannot cut yet: no blade in the box and none of their fitting blades in the cart.
export function bladeReminders<T extends { slug: string }>(
  cartSlugs: string[],
  fits: MachineBlades<T>[],
): MachineBlades<T>[] {
  const inCart = new Set(cartSlugs);
  return fits.filter(
    (m) => inCart.has(m.slug) && !m.bladeIncluded && m.blades.length > 0 && !m.blades.some((b) => inCart.has(b.slug)),
  );
}
