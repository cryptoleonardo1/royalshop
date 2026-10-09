import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/admin";
import { foldText } from "@/lib/format";
import { discountPct } from "@/lib/pricing";
import type { ShippingZone } from "@/lib/shipping";

// Public catalog reads. Everything here goes through the anon key (RLS: active products only)
// and is cached under the "catalog" tag, so admin edits can call revalidateTag("catalog").

export type BatteryPlatform = "LXT_18V" | "XGT_40V" | "CXT_12V" | "none";
export type ShippingClass = "courier" | "own_transport" | "pickup_only";

export interface Category {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  // active products in this category and all of its descendants
  productCount: number;
}

export interface ProductSpec {
  key: string;
  label: string;
  value: string;
  unit: string | null;
  isFilterable: boolean;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  priceGrossCents: number;
  compareAtPriceCents: number | null;
  vatRate: number;
  batteryPlatform: BatteryPlatform;
  isKit: boolean;
  shippingClass: ShippingClass;
  isFeatured: boolean;
  createdAt: string;
  brand: { slug: string; name: string };
  category: { slug: string; name: string };
  leadDays: { min: number; max: number };
  image: { path: string; alt: string | null } | null;
  specs: ProductSpec[];
  // Omnibus reference: lowest price in the 30 days before the current price took effect.
  // Set only for discounted products; the discount is computed from this, not from compare_at.
  lowestPrice30dCents: number | null;
}

export interface ProductDetail extends ProductSummary {
  ean: string | null;
  shortDescription: string | null;
  description: string | null;
  weightKg: number | null;
  warrantyMonths: number;
  manufacturerWarrantyNote: string | null;
  safetyInfo: string | null;
  rentalUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  images: { path: string; alt: string | null }[];
  documents: { type: string; title: string; path: string }[];
  manufacturer: { name: string | null; address: string | null; email: string | null; website: string | null };
  batteries: ProductSummary[];
}

export interface ShopSettings {
  companyName: string;
  street: string | null;
  city: string | null;
  zip: string | null;
  ico: string | null;
  dic: string | null;
  icDph: string | null;
  registerInfo: string | null;
  email: string | null;
  phone: string | null;
  courierPriceCents: number;
  freeShippingThresholdCents: number;
  pickupAddress: string | null;
  pickupHours: string | null;
  handlingDays: number;
}

const SUMMARY_SELECT = `
  id, slug, name, sku, price_gross_cents, compare_at_price_cents, vat_rate, battery_platform, is_kit,
  shipping_class, is_featured, created_at,
  brand:brands(slug, name),
  category:categories(slug, name),
  supplier:suppliers(lead_time_days_min, lead_time_days_max),
  images:product_images(path, alt, sort_order),
  specs:product_specs(key, label, value, unit, is_filterable, sort_order)
`;

const DETAIL_SELECT = `
  ${SUMMARY_SELECT},
  ean, short_description, description, weight_kg, warranty_months, manufacturer_warranty_note, safety_info,
  rental_url, seo_title, seo_description,
  brand_gpsr:brands(manufacturer_name, manufacturer_address, manufacturer_email, website),
  documents:product_documents(type, title, path)
`;

// Untyped rows (no generated DB types yet); mapped into the shapes above in one place.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const bySort = (a: Row, b: Row) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

function toSummary(r: Row, lowestPrice30dCents: number | null = null): ProductSummary {
  const images = [...(r.images ?? [])].sort(bySort);
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    sku: r.sku,
    priceGrossCents: r.price_gross_cents,
    compareAtPriceCents: r.compare_at_price_cents,
    vatRate: Number(r.vat_rate),
    batteryPlatform: r.battery_platform,
    isKit: r.is_kit,
    shippingClass: r.shipping_class,
    isFeatured: r.is_featured,
    createdAt: r.created_at,
    brand: { slug: r.brand?.slug ?? "", name: r.brand?.name ?? "" },
    category: { slug: r.category?.slug ?? "", name: r.category?.name ?? "" },
    leadDays: { min: r.supplier?.lead_time_days_min ?? 2, max: r.supplier?.lead_time_days_max ?? 2 },
    image: images[0] ? { path: images[0].path, alt: images[0].alt } : null,
    specs: [...(r.specs ?? [])].sort(bySort).map((s: Row) => ({
      key: s.key,
      label: s.label,
      value: s.value,
      unit: s.unit,
      isFilterable: s.is_filterable,
    })),
    lowestPrice30dCents,
  };
}

const isMarkedDown = (r: Row) => r.compare_at_price_cents != null && r.compare_at_price_cents > r.price_gross_cents;

async function lowestPrice30d(db: ReturnType<typeof createPublicClient>, productId: string): Promise<number | null> {
  const { data, error } = await db.rpc("lowest_price_30d", { p_product_id: productId });
  if (error) fail("lowest price", error);
  return data ?? null;
}

function fail(what: string, error: { message: string } | null): never {
  throw new Error(`catalog: ${what} failed${error ? `: ${error.message}` : ""}`);
}

function tagCatalog() {
  cacheLife("hours");
  cacheTag("catalog");
}

// ───────────────────────────── Categories ─────────────────────────────

export async function getCategories(): Promise<Category[]> {
  "use cache";
  tagCatalog();
  const db = createPublicClient();
  const [cats, prods] = await Promise.all([
    db.from("categories").select("id, parent_id, slug, name, description, sort_order").order("sort_order"),
    db.from("products").select("category_id").eq("status", "active"),
  ]);
  if (cats.error) fail("categories", cats.error);
  if (prods.error) fail("category counts", prods.error);

  const direct = new Map<string, number>();
  for (const p of prods.data) direct.set(p.category_id, (direct.get(p.category_id) ?? 0) + 1);

  const rows = cats.data as Row[];
  const childrenOf = (id: string) => rows.filter((c) => c.parent_id === id);
  const total = (id: string): number => (direct.get(id) ?? 0) + childrenOf(id).reduce((sum, c) => sum + total(c.id), 0);

  return rows.map((c) => ({
    id: c.id,
    parentId: c.parent_id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    sortOrder: c.sort_order,
    productCount: total(c.id),
  }));
}

export async function getTopCategories(): Promise<Category[]> {
  const all = await getCategories();
  return all.filter((c) => !c.parentId);
}

export interface CategoryContext {
  category: Category;
  // root first, the category itself excluded
  ancestors: Category[];
  children: Category[];
  siblings: Category[];
}

export async function getCategoryContext(slug: string): Promise<CategoryContext | null> {
  const all = await getCategories();
  const category = all.find((c) => c.slug === slug);
  if (!category) return null;
  const ancestors: Category[] = [];
  let parentId = category.parentId;
  while (parentId) {
    const parent = all.find((c) => c.id === parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    parentId = parent.parentId;
  }
  return {
    category,
    ancestors,
    children: all.filter((c) => c.parentId === category.id && c.productCount > 0),
    siblings: category.parentId ? all.filter((c) => c.parentId === category.parentId && c.productCount > 0) : [],
  };
}

// ───────────────────────────── Product lists ─────────────────────────────

export async function getAllProducts(): Promise<ProductSummary[]> {
  "use cache";
  tagCatalog();
  const db = createPublicClient();
  const { data, error } = await db.from("products").select(SUMMARY_SELECT).eq("status", "active").order("name");
  if (error) fail("products", error);
  const rows = data as Row[];
  const lowest = new Map(
    await Promise.all(rows.filter(isMarkedDown).map(async (r) => [r.id, await lowestPrice30d(db, r.id)] as const)),
  );
  return rows.map((r) => toSummary(r, lowest.get(r.id) ?? null));
}

export async function getCategoryProducts(slug: string): Promise<ProductSummary[]> {
  const [all, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const root = categories.find((c) => c.slug === slug);
  if (!root) return [];
  const slugs = new Set<string>([root.slug]);
  let frontier = [root.id];
  while (frontier.length) {
    const next = categories.filter((c) => c.parentId && frontier.includes(c.parentId));
    next.forEach((c) => slugs.add(c.slug));
    frontier = next.map((c) => c.id);
  }
  return all.filter((p) => slugs.has(p.category.slug));
}

export async function getFeaturedProducts(limit = 6): Promise<ProductSummary[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.isFeatured).slice(0, limit);
}

export async function getSaleProducts(limit = 6): Promise<ProductSummary[]> {
  const all = await getAllProducts();
  return all
    .filter((p) => discountPct(p) > 0)
    .sort((a, b) => discountPct(b) - discountPct(a))
    .slice(0, limit);
}

export async function getPlatformCounts(): Promise<Record<BatteryPlatform, number>> {
  const all = await getAllProducts();
  const counts: Record<BatteryPlatform, number> = { LXT_18V: 0, XGT_40V: 0, CXT_12V: 0, none: 0 };
  all.forEach((p) => counts[p.batteryPlatform]++);
  return counts;
}

export async function getProductSlugs(): Promise<string[]> {
  const all = await getAllProducts();
  return all.map((p) => p.slug);
}

// ───────────────────────────── Search ─────────────────────────────

// Prefix match on every word against products.search_vector (unaccented name, SKU, EAN, short text).
export async function searchProducts(query: string, limit = 48): Promise<ProductSummary[]> {
  "use cache";
  tagCatalog();
  const words = foldText(query)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .slice(0, 8);
  if (words.length === 0) return [];
  const { data, error } = await createPublicClient()
    .from("products")
    .select(SUMMARY_SELECT)
    .eq("status", "active")
    .textSearch("search_vector", words.map((w) => `${w}:*`).join(" & "), { config: "simple" })
    .order("is_featured", { ascending: false })
    .order("name")
    .limit(limit);
  if (error) fail("search", error);
  const lowest = new Map((await getAllProducts()).map((p) => [p.id, p.lowestPrice30dCents]));
  return (data as Row[]).map((r) => toSummary(r, lowest.get(r.id) ?? null));
}

// ───────────────────────────── Product detail ─────────────────────────────

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  "use cache";
  tagCatalog();
  const db = createPublicClient();
  const { data, error } = await db
    .from("products")
    .select(DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) fail("product", error);
  if (!data) return null;
  const r = data as Row;

  const [lowest, related] = await Promise.all([
    isMarkedDown(r) ? lowestPrice30d(db, r.id) : null,
    db.from("related_products").select("related_id, type").eq("product_id", r.id),
  ]);
  if (related.error) fail("related products", related.error);

  const relatedIds = new Set((related.data as Row[]).filter((x) => x.type === "battery").map((x) => x.related_id));
  const batteries = relatedIds.size ? (await getAllProducts()).filter((p) => relatedIds.has(p.id)) : [];

  return {
    ...toSummary(r, lowest),
    ean: r.ean,
    shortDescription: r.short_description,
    description: r.description,
    weightKg: r.weight_kg == null ? null : Number(r.weight_kg),
    warrantyMonths: r.warranty_months,
    manufacturerWarrantyNote: r.manufacturer_warranty_note,
    safetyInfo: r.safety_info,
    rentalUrl: r.rental_url,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    images: [...(r.images ?? [])].sort(bySort).map((i: Row) => ({ path: i.path, alt: i.alt })),
    documents: r.documents ?? [],
    manufacturer: {
      name: r.brand_gpsr?.manufacturer_name ?? null,
      address: r.brand_gpsr?.manufacturer_address ?? null,
      email: r.brand_gpsr?.manufacturer_email ?? null,
      website: r.brand_gpsr?.website ?? null,
    },
    batteries,
  };
}

// ───────────────────────────── Settings ─────────────────────────────

export async function getShopSettings(): Promise<ShopSettings> {
  "use cache";
  tagCatalog();
  const { data, error } = await createPublicClient().from("company_settings").select("*").eq("id", 1).maybeSingle();
  if (error) fail("settings", error);
  const s = (data ?? {}) as Row;
  return {
    companyName: s.company_name ?? "Royal Shop",
    street: s.street ?? null,
    city: s.city ?? null,
    zip: s.zip ?? null,
    ico: s.ico ?? null,
    dic: s.dic ?? null,
    icDph: s.ic_dph ?? null,
    registerInfo: s.register_info ?? null,
    email: s.email ?? null,
    phone: s.phone ?? null,
    courierPriceCents: s.courier_price_cents ?? 690,
    freeShippingThresholdCents: s.free_shipping_threshold_cents ?? 200000,
    pickupAddress: s.pickup_address ?? null,
    pickupHours: s.pickup_hours ?? null,
    handlingDays: s.handling_days ?? 1,
  };
}

export async function getShippingZones(): Promise<ShippingZone[]> {
  "use cache";
  tagCatalog();
  const { data, error } = await createPublicClient()
    .from("shipping_zones")
    .select("id, name, max_km, price_cents")
    .order("sort_order");
  if (error) fail("shipping zones", error);
  return data as ShippingZone[];
}
