// Discount maths shared by listings, cards and the product page (pure, no server imports).

interface PricedProduct {
  priceGrossCents: number;
  compareAtPriceCents: number | null;
  lowestPrice30dCents: number | null;
}

// The price a discount is measured against (zákon 108/2024 § 7 as amended by 310/2025): the lowest
// price of the previous 30 days. Without price history we fall back to compare_at.
export function referencePrice(p: PricedProduct) {
  const ref = p.lowestPrice30dCents ?? p.compareAtPriceCents;
  return p.compareAtPriceCents != null && ref != null && ref > p.priceGrossCents ? ref : null;
}

export function discountPct(p: PricedProduct) {
  const ref = referencePrice(p);
  return ref ? Math.round((1 - p.priceGrossCents / ref) * 100) : 0;
}
