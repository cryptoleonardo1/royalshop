// Demo seed: catalog from supabase/seed-data/catalog.json + users, orders in every state, invoices,
// a withdrawal and claims. Works against local or hosted Supabase (service role).
//
//   npx tsx scripts/seed.ts            (reads .env.local)
//
// Idempotent-ish: wipes demo tables first. NEVER run against production data.

import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { computeLine, computeTotals, eurToCents } from "../src/lib/money";
import { timelineFor, type OrderStatus, type ShippingMethod } from "../src/lib/order-state";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");

const db = createClient(url, key, { auth: { persistSession: false } });

const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "RoyalDemo2026!";

interface CatalogJson {
  suppliers: {
    slug: string; name: string; country: string; lead_time_days_min: number; lead_time_days_max: number;
    default_margin_pct: number; is_eu_import: boolean; contact_email: string | null; note?: string;
  }[];
  categories: { slug: string; name: string; parent_slug: string | null; description?: string; sort_order?: number }[];
  brands: { slug: string; name: string; manufacturer_name?: string; manufacturer_address?: string; manufacturer_email?: string; website?: string }[];
  products: {
    slug: string; name: string; brand_slug: string; supplier_slug: string; category_slug: string;
    sku: string; ean: string | null; short_description: string; description: string;
    price_gross_eur: number; compare_at_price_eur: number | null; purchase_price_net_eur: number; price_on_request?: boolean;
    vat_rate: number; weight_kg: number | null; shipping_class: string; battery_platform: string; is_kit: boolean;
    warranty_months: number; manufacturer_warranty_note: string | null; safety_info: string;
    is_featured: boolean; rental_url: string | null;
    specs: { key: string; label: string; value: string; unit: string | null; is_filterable: boolean }[];
    images: string[];
  }[];
}

function must<T>(res: { data: T; error: { message: string } | null }, what: string): NonNullable<T> {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data as NonNullable<T>;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

async function wipe() {
  must(await db.rpc("seed_reset"), "seed_reset");
}

async function seedSettings() {
  must(
    await db.from("company_settings").upsert({
      id: 1,
      company_name: "Royal Shop s. r. o. (demo)",
      street: "Diaľničná cesta 1",
      city: "Senec",
      zip: "903 01",
      ico: "00000000",
      dic: "0000000000",
      ic_dph: "SK0000000000",
      register_info: "Zapísaná v Obchodnom registri Mestského súdu Bratislava III (demo údaje)",
      iban: "SK00 0900 0000 0000 0000 0000",
      swift: "GIBASKBX",
      email: "info@royalshop.test",
      phone: "+421 900 000 000",
      web: "royalshop.test",
      is_vat_payer: true,
      courier_price_cents: 690,
      free_shipping_threshold_cents: 200000,
      pickup_address: "Pobočka Royal Stroje, Senec",
      pickup_hours: "Po–Pi 7:00–16:00",
      handling_days: 1,
      invoice_due_days: 14,
    }),
    "settings",
  );
  must(
    await db.from("shipping_zones").insert([
      { name: "Do 30 km od Senca", max_km: 30, price_cents: 3900, sort_order: 1 },
      { name: "Do 80 km od Senca", max_km: 80, price_cents: 7900, sort_order: 2 },
      { name: "Do 150 km od Senca", max_km: 150, price_cents: 12900, sort_order: 3 },
      { name: "Celé Slovensko", max_km: 500, price_cents: 19900, sort_order: 4 },
    ]),
    "zones",
  );
}

async function seedCatalog() {
  const catalog: CatalogJson = JSON.parse(readFileSync("supabase/seed-data/catalog.json", "utf8"));

  const suppliers = must(await db.from("suppliers").insert(catalog.suppliers).select("id, slug"), "suppliers");
  const supplierId = Object.fromEntries(suppliers.map((s) => [s.slug, s.id]));

  const brands = must(await db.from("brands").insert(catalog.brands).select("id, slug"), "brands");
  const brandId = Object.fromEntries(brands.map((b) => [b.slug, b.id]));

  const categoryId: Record<string, string> = {};
  const pending = [...catalog.categories];
  while (pending.length) {
    const ready = pending.filter((c) => !c.parent_slug || categoryId[c.parent_slug]);
    if (!ready.length) throw new Error("Category parents unresolved: " + pending.map((c) => c.slug).join(", "));
    const rows = must(
      await db.from("categories").insert(
        ready.map((c, i) => ({
          slug: c.slug, name: c.name, description: c.description ?? null,
          parent_id: c.parent_slug ? categoryId[c.parent_slug] : null, sort_order: c.sort_order ?? i,
        })),
      ).select("id, slug"),
      "categories",
    );
    rows.forEach((r) => (categoryId[r.slug] = r.id));
    ready.forEach((c) => pending.splice(pending.indexOf(c), 1));
  }

  const productIds: Record<string, string> = {};
  for (const p of catalog.products) {
    // Sale items: insert the old price first so price_history has a real "before" for the Omnibus 30-day rule.
    const startPrice = p.compare_at_price_eur ?? p.price_gross_eur;
    const row = must(
      await db.from("products").insert({
        slug: p.slug, name: p.name, brand_id: brandId[p.brand_slug], supplier_id: supplierId[p.supplier_slug],
        category_id: categoryId[p.category_slug], sku: p.sku, ean: p.ean, short_description: p.short_description,
        description: p.description, price_gross_cents: eurToCents(startPrice), vat_rate: p.vat_rate,
        weight_kg: p.weight_kg, shipping_class: p.shipping_class, battery_platform: p.battery_platform, is_kit: p.is_kit,
        warranty_months: p.warranty_months, manufacturer_warranty_note: p.manufacturer_warranty_note,
        safety_info: p.safety_info, status: "active", is_featured: p.is_featured, rental_url: p.rental_url,
        price_on_request: p.price_on_request ?? false,
      }).select("id").single(),
      `product ${p.slug}`,
    );
    productIds[p.slug] = row.id;
    if (p.compare_at_price_eur) {
      must(
        await db.from("price_history").update({ valid_from: daysAgo(45).toISOString() }).eq("product_id", row.id),
        "backdate price",
      );
      must(
        await db.from("products").update({
          price_gross_cents: eurToCents(p.price_gross_eur), compare_at_price_cents: eurToCents(p.compare_at_price_eur),
        }).eq("id", row.id),
        "sale price",
      );
    }
    must(await db.from("product_costs").insert({ product_id: row.id, purchase_price_net_cents: eurToCents(p.purchase_price_net_eur) }), "cost");
    if (p.images.length) {
      must(await db.from("product_images").insert(p.images.map((path, i) => ({ product_id: row.id, path, alt: p.name, sort_order: i }))), "images");
    }
    if (p.specs.length) {
      must(await db.from("product_specs").insert(p.specs.map((s, i) => ({ ...s, product_id: row.id, sort_order: i }))), "specs");
    }
  }

  // Batteries are related to every product on the same platform.
  const batteries = catalog.products.filter((p) => p.category_slug.includes("bater"));
  const related = catalog.products.flatMap((p) =>
    p.battery_platform === "none" || batteries.includes(p)
      ? []
      : batteries.filter((b) => b.battery_platform === p.battery_platform).map((b) => ({
          product_id: productIds[p.slug], related_id: productIds[b.slug], type: "battery",
        })),
  );
  if (related.length) must(await db.from("related_products").insert(related), "related");

  console.log(`catalog: ${catalog.products.length} products, ${catalog.categories.length} categories`);
  return { catalog, productIds, supplierId };
}

async function ensureUser(email: string, meta: Record<string, unknown>, role: "admin" | "customer") {
  const list = await db.auth.admin.listUsers({ perPage: 200 });
  if (list.error) throw new Error("list users: " + list.error.message);
  let user = list.data.users.find((u) => u.email === email);
  if (!user) {
    const created = await db.auth.admin.createUser({ email, password: DEMO_PASSWORD, email_confirm: true, user_metadata: meta });
    if (created.error) throw new Error(`user ${email}: ${created.error.message}`);
    user = created.data.user;
  }
  must(await db.from("profiles").update({ role }).eq("id", user.id), "role");
  return user.id;
}

interface DemoOrder {
  profileKey: "jana" | "peter" | "firma";
  items: { slug: string; qty: number }[];
  method: ShippingMethod;
  status: OrderStatus;
  createdDaysAgo: number;
  deliveredDaysAgo?: number;
}

const ORDERS: DemoOrder[] = [
  { profileKey: "jana", items: [{ slug: "", qty: 1 }], method: "courier", status: "paid_authorized", createdDaysAgo: 0 },
  { profileKey: "jana", items: [{ slug: "", qty: 1 }, { slug: "", qty: 1 }], method: "pickup_senec", status: "ordered_from_supplier", createdDaysAgo: 2 },
  { profileKey: "jana", items: [{ slug: "", qty: 1 }], method: "courier", status: "delivered", createdDaysAgo: 8, deliveredDaysAgo: 3 },
  { profileKey: "jana", items: [{ slug: "", qty: 1 }], method: "courier", status: "completed", createdDaysAgo: 60, deliveredDaysAgo: 55 },
  { profileKey: "peter", items: [{ slug: "", qty: 1 }], method: "courier", status: "delivered", createdDaysAgo: 10, deliveredDaysAgo: 5 },
  { profileKey: "peter", items: [{ slug: "", qty: 1 }], method: "courier", status: "cancelled", createdDaysAgo: 20 },
  { profileKey: "firma", items: [{ slug: "", qty: 1 }], method: "own_transport", status: "out_for_delivery", createdDaysAgo: 6 },
  { profileKey: "firma", items: [{ slug: "", qty: 1 }, { slug: "", qty: 1 }], method: "pickup_senec", status: "ready_for_pickup", createdDaysAgo: 5 },
  { profileKey: "firma", items: [{ slug: "", qty: 2 }], method: "courier", status: "tested", createdDaysAgo: 4 },
  { profileKey: "firma", items: [{ slug: "", qty: 1 }], method: "courier", status: "confirmed", createdDaysAgo: 1 },
];

async function seedPeopleAndOrders(ctx: Awaited<ReturnType<typeof seedCatalog>>) {
  await ensureUser("admin@royalshop.test", { first_name: "Admin", last_name: "Royal" }, "admin");
  await ensureUser("founder@royalshop.test", { first_name: "Founder", last_name: "Royal" }, "admin");

  const people = {
    jana: {
      id: await ensureUser("jana.kovacova@example.sk", { first_name: "Jana", last_name: "Kováčová", phone: "+421 905 111 222", customer_type: "person" }, "customer"),
      type: "person" as const, email: "jana.kovacova@example.sk", phone: "+421 905 111 222",
      billing: { name: "Jana Kováčová", street: "Hlavná 12", city: "Pezinok", zip: "902 01", country: "SK" },
      company: null,
    },
    peter: {
      id: await ensureUser("peter.horvath@example.sk", { first_name: "Peter", last_name: "Horváth", phone: "+421 907 333 444", customer_type: "person" }, "customer"),
      type: "person" as const, email: "peter.horvath@example.sk", phone: "+421 907 333 444",
      billing: { name: "Peter Horváth", street: "Mierová 45", city: "Trnava", zip: "917 01", country: "SK" },
      company: null,
    },
    firma: {
      id: await ensureUser("nakup@stavbyvajda.example.sk", {
        first_name: "Marek", last_name: "Vajda", phone: "+421 911 555 666", customer_type: "company",
        company_name: "Stavby Vajda s.r.o.", ico: "12345678", dic: "2120000000", ic_dph: "SK2120000000",
      }, "customer"),
      type: "company" as const, email: "nakup@stavbyvajda.example.sk", phone: "+421 911 555 666",
      billing: { name: "Stavby Vajda s.r.o.", street: "Priemyselná 8", city: "Galanta", zip: "924 01", country: "SK" },
      company: { name: "Stavby Vajda s.r.o.", ico: "12345678", dic: "2120000000", ic_dph: "SK2120000000" },
    },
  };

  for (const p of Object.values(people)) {
    await db.from("addresses").delete().eq("profile_id", p.id);
    must(await db.from("addresses").insert({ profile_id: p.id, type: "billing", ...p.billing, is_default: true }), "address");
  }

  // Pick products deterministically: courier items for courier orders, heavy for own transport.
  // Price-on-request products cannot be ordered online, so they never appear in demo orders.
  const products = ctx.catalog.products.filter((p) => !p.price_on_request);
  const courierItems = products.filter((p) => p.shipping_class === "courier");
  const heavyItems = products.filter((p) => p.shipping_class === "own_transport");
  let ci = 0;
  let hi = 0;

  const settings = must(await db.from("company_settings").select("*").eq("id", 1).single(), "settings read");
  const zones = must(await db.from("shipping_zones").select("*").order("sort_order"), "zones read");
  const created: { id: string; number: string; demo: DemoOrder; itemIds: string[] }[] = [];

  for (const demo of [...ORDERS].sort((a, b) => b.createdDaysAgo - a.createdDaysAgo)) {
    const person = people[demo.profileKey];
    const picked = demo.items.map((it) => {
      const src = demo.method === "own_transport" && heavyItems.length ? heavyItems[hi++ % heavyItems.length] : courierItems[ci++ % courierItems.length];
      return { product: src, qty: it.qty };
    });
    const lines = picked.map(({ product, qty }) => ({
      product,
      qty,
      ...computeLine({ unitPriceGrossCents: eurToCents(product.price_gross_eur), quantity: qty, vatRate: product.vat_rate }),
      vatRate: product.vat_rate,
    }));
    const subtotal = lines.reduce((s, l) => s + l.lineGrossCents, 0);
    const zone = demo.method === "own_transport" ? zones[0] : null;
    const shipping =
      demo.method === "pickup_senec" || subtotal >= settings.free_shipping_threshold_cents
        ? 0
        : demo.method === "courier" ? settings.courier_price_cents : zone!.price_cents;
    const shippingLine = shipping ? { ...computeLine({ unitPriceGrossCents: shipping, quantity: 1, vatRate: 23 }), vatRate: 23 } : null;
    const totals = computeTotals(shippingLine ? [...lines, shippingLine] : lines);

    const createdAt = daysAgo(demo.createdDaysAgo);
    const deliveredAt = demo.deliveredDaysAgo !== undefined ? daysAgo(demo.deliveredDaysAgo) : null;
    const withdrawalDeadline = deliveredAt && person.type === "person" ? new Date(deliveredAt.getTime() + 14 * 86_400_000) : null;
    const number = must(await db.rpc("next_document_number", { p_kind: "order", p_date: createdAt.toISOString().slice(0, 10) }), "order number") as string;

    const paid = !["pending_payment", "cancelled"].includes(demo.status);
    const captured = paid && demo.status !== "paid_authorized";
    const order = must(
      await db.from("orders").insert({
        order_number: number, profile_id: person.id, customer_type: person.type, email: person.email, phone: person.phone,
        billing: person.billing, shipping_address: demo.method === "pickup_senec" ? null : person.billing, company: person.company,
        shipping_method: demo.method, shipping_zone_id: zone?.id ?? null, shipping_price_cents: shipping,
        subtotal_gross_cents: subtotal, total_net_cents: totals.netCents, total_vat_cents: totals.vatCents, total_gross_cents: totals.grossCents,
        status: demo.status,
        payment_status: demo.status === "cancelled" ? "cancelled" : captured ? "paid" : paid ? "authorized" : "unpaid",
        estimated_delivery_date: new Date(createdAt.getTime() + 5 * 86_400_000).toISOString().slice(0, 10),
        delivered_at: deliveredAt?.toISOString() ?? null,
        withdrawal_deadline: withdrawalDeadline?.toISOString() ?? null,
        terms_version: "demo-1", terms_accepted_at: createdAt.toISOString(), created_at: createdAt.toISOString(),
      }).select("id").single(),
      "order",
    );

    const items = must(
      await db.from("order_items").insert(
        lines.map((l) => ({
          order_id: order.id, product_id: ctx.productIds[l.product.slug], name: l.product.name, sku: l.product.sku, ean: l.product.ean,
          supplier_id: ctx.supplierId[l.product.supplier_slug], quantity: l.qty, unit_price_gross_cents: eurToCents(l.product.price_gross_eur),
          vat_rate: l.vatRate, line_net_cents: l.lineNetCents, line_vat_cents: l.lineVatCents, line_gross_cents: l.lineGrossCents,
          purchase_price_net_cents: eurToCents(l.product.purchase_price_net_eur),
          serial_number: ["tested", "shipped", "out_for_delivery", "ready_for_pickup", "delivered", "completed"].includes(demo.status)
            ? `SN${Math.floor(100000 + Math.random() * 899999)}` : null,
        })),
      ).select("id"),
      "items",
    );

    // Status history up to the current status.
    const steps = timelineFor(demo.method);
    const reached = demo.status === "cancelled" ? ["cancelled"] : demo.status === "completed" ? [...steps, "completed"] : steps.slice(0, steps.indexOf(demo.status) + 1);
    let prev: string | null = "pending_payment";
    const history = reached.map((s, i) => {
      const row = { order_id: order.id, from_status: prev, to_status: s, created_at: new Date(createdAt.getTime() + i * 6 * 3_600_000).toISOString() };
      prev = s;
      return row;
    });
    must(await db.from("order_status_history").insert(history), "history");

    if (paid || demo.status === "cancelled") {
      must(
        await db.from("payments").insert({
          order_id: order.id, provider: "stripe", stripe_payment_intent_id: `pi_demo_${number}`, amount_cents: totals.grossCents,
          status: demo.status === "cancelled" ? "cancelled" : captured ? "captured" : "authorized",
          authorized_at: createdAt.toISOString(), authorization_expires_at: new Date(createdAt.getTime() + 7 * 86_400_000).toISOString(),
          captured_at: captured ? new Date(createdAt.getTime() + 6 * 3_600_000).toISOString() : null,
        }),
        "payment",
      );
    }

    if (captured) {
      const supplierSlugs = [...new Set(lines.map((l) => l.product.supplier_slug))];
      if (!["confirmed"].includes(demo.status)) {
        must(
          await db.from("supplier_orders").insert(
            supplierSlugs.map((s) => ({
              order_id: order.id, supplier_id: ctx.supplierId[s], reference: `DEMO-${s.toUpperCase()}-${number}`,
              ordered_at: new Date(createdAt.getTime() + 12 * 3_600_000).toISOString(),
              received_at: demo.status === "ordered_from_supplier" ? null : new Date(createdAt.getTime() + 2 * 86_400_000).toISOString(),
              purchase_total_net_cents: lines.filter((l) => l.product.supplier_slug === s).reduce((sum, l) => sum + eurToCents(l.product.purchase_price_net_eur) * l.qty, 0),
            })),
          ),
          "supplier orders",
        );
      }
      if (demo.status === "shipped" || deliveredAt) {
        if (demo.method === "courier") {
          must(await db.from("shipments").insert({ order_id: order.id, carrier: "Kuriér (demo)", tracking_number: `DEMO${number.replace(/\D/g, "")}`, delivered_at: deliveredAt?.toISOString() ?? null }), "shipment");
        }
      }
    }

    created.push({ id: order.id, number, demo, itemIds: items.map((i) => i.id) });
  }

  return { people, created };
}

async function seedInvoices(created: Awaited<ReturnType<typeof seedPeopleAndOrders>>["created"]) {
  const settings = must(await db.from("company_settings").select("*").eq("id", 1).single(), "settings read");
  const supplierSnapshot = {
    name: settings.company_name, street: settings.street, city: settings.city, zip: settings.zip, country: settings.country,
    ico: settings.ico, dic: settings.dic, ic_dph: settings.ic_dph, register_info: settings.register_info,
    iban: settings.iban, swift: settings.swift, email: settings.email, phone: settings.phone, web: settings.web,
  };

  // Oldest first so invoice numbers follow order dates.
  const captured = created
    .filter((c) => !["pending_payment", "paid_authorized", "cancelled"].includes(c.demo.status))
    .sort((a, b) => b.demo.createdDaysAgo - a.demo.createdDaysAgo);

  for (const c of captured) {
    const order = must(await db.from("orders").select("*, order_items(*)").eq("id", c.id).single(), "order read");
    const paidDate = new Date(new Date(order.created_at).getTime() + 6 * 3_600_000).toISOString().slice(0, 10);
    const lines = [
      ...order.order_items.map((it: { sku: string; name: string; quantity: number; unit_price_gross_cents: number; vat_rate: number; line_net_cents: number; line_vat_cents: number; line_gross_cents: number }, i: number) => ({
        position: i + 1, code: it.sku, description: it.name, quantity: it.quantity, unit: "ks",
        unit_price_net_cents: computeLine({ unitPriceGrossCents: it.unit_price_gross_cents, quantity: 1, vatRate: Number(it.vat_rate) }).unitPriceNetCents,
        vat_rate: it.vat_rate, line_net_cents: it.line_net_cents, line_vat_cents: it.line_vat_cents, line_gross_cents: it.line_gross_cents,
      })),
    ];
    if (order.shipping_price_cents > 0) {
      const s = computeLine({ unitPriceGrossCents: order.shipping_price_cents, quantity: 1, vatRate: 23 });
      lines.push({
        position: lines.length + 1, code: "DOPRAVA", description: order.shipping_method === "courier" ? "Doprava kuriérom" : "Doprava vlastnou technikou",
        quantity: 1, unit: "ks", unit_price_net_cents: s.unitPriceNetCents, vat_rate: 23,
        line_net_cents: s.lineNetCents, line_vat_cents: s.lineVatCents, line_gross_cents: s.lineGrossCents,
      });
    }
    const totals = computeTotals(lines.map((l) => ({ lineNetCents: l.line_net_cents, lineVatCents: l.line_vat_cents, lineGrossCents: l.line_gross_cents, unitPriceNetCents: 0, vatRate: Number(l.vat_rate) })));

    const invoice = must(
      await db.from("invoices").insert({
        type: "invoice", status: "draft", order_id: order.id, profile_id: order.profile_id,
        tax_point_date: paidDate, payment_method: "karta", paid_at: `${paidDate}T12:00:00Z`,
        header_text: `Fakturujeme Vám tovar podľa objednávky č. ${order.order_number}:`,
        note: `Uhradené platobnou kartou dňa ${paidDate.split("-").reverse().join(". ")}. Neuhrádzajte.`,
        supplier_snapshot: supplierSnapshot,
        customer_snapshot: { ...order.billing, email: order.email, phone: order.phone, ...(order.company ?? {}) },
        total_net_cents: totals.netCents, total_vat_cents: totals.vatCents, total_gross_cents: totals.grossCents,
        vat_recap: totals.recap,
      }).select("id").single(),
      "invoice",
    );
    must(await db.from("invoice_lines").insert(lines.map((l) => ({ ...l, invoice_id: invoice.id }))), "invoice lines");
    must(await db.rpc("issue_invoice", { p_invoice_id: invoice.id, p_issue_date: paidDate }), "issue invoice");
  }
  console.log(`invoices: ${captured.length}`);
}

async function seedReturnsAndClaims(ctx: Awaited<ReturnType<typeof seedPeopleAndOrders>>) {
  const { people, created } = ctx;

  // Peter withdrew from his delivered order 2 days ago; goods on the way back.
  const peterOrder = created.find((c) => c.demo.profileKey === "peter" && c.demo.status === "delivered")!;
  const retNumber = must(await db.rpc("next_document_number", { p_kind: "return" }), "return number") as string;
  must(
    await db.from("returns").insert({
      return_number: retNumber, order_id: peterOrder.id, profile_id: people.peter.id, name: "Peter Horváth", email: people.peter.email,
      reason: "Rozmyslel som si to, potrebujem výkonnejší model.", channel: "portal", status: "awaiting_goods",
      submitted_at: daysAgo(2).toISOString(), confirmation_sent_at: daysAgo(2).toISOString(),
    }),
    "return",
  );

  // Jana: claim on the old completed order, waiting at supplier.
  const janaOld = created.find((c) => c.demo.profileKey === "jana" && c.demo.status === "completed")!;
  const claim1 = must(await db.rpc("next_document_number", { p_kind: "claim" }), "claim number") as string;
  const c1 = must(
    await db.from("claims").insert({
      claim_number: claim1, order_id: janaOld.id, order_item_id: janaOld.itemIds[0], profile_id: people.jana.id,
      description: "Po zhruba 6 týždňoch používania stroj pri zaťažení zhasína a motor nedrží otáčky.",
      requested_remedy: "repair", delivery_method: "courier_pickup", status: "at_supplier",
      submitted_at: daysAgo(12).toISOString(), confirmation_sent_at: daysAgo(12).toISOString(), supplier_reference: "SRV-2026-0815",
    }).select("id").single(),
    "claim 1",
  );
  must(
    await db.from("claim_messages").insert([
      { claim_id: c1.id, author_id: people.jana.id, is_staff: false, body: "Dobrý deň, prikladám fotky. Kedy si ho kuriér vyzdvihne?", created_at: daysAgo(12).toISOString() },
      { claim_id: c1.id, is_staff: true, body: "Dobrý deň, zvoz sme objednali na zajtra. Po prijatí ho odovzdáme do autorizovaného servisu.", created_at: daysAgo(11).toISOString() },
    ]),
    "claim messages",
  );

  // Firma: fresh claim awaiting confirmation (B2B).
  const firmaOrder = created.find((c) => c.demo.profileKey === "firma" && c.demo.status === "out_for_delivery")!;
  const claim2 = must(await db.rpc("next_document_number", { p_kind: "claim" }), "claim number") as string;
  must(
    await db.from("claims").insert({
      claim_number: claim2, order_id: firmaOrder.id, order_item_id: firmaOrder.itemIds[0], profile_id: people.firma.id,
      description: "Pri preprave sa poškodil kryt, stroj je funkčný. Žiadame výmenu krytu.",
      requested_remedy: "repair", delivery_method: "own_transport_pickup", status: "submitted", submitted_at: daysAgo(0).toISOString(),
    }),
    "claim 2",
  );
  console.log("returns: 1, claims: 2");
}

async function main() {
  await wipe();
  await seedSettings();
  const catalogCtx = await seedCatalog();
  const orderCtx = await seedPeopleAndOrders(catalogCtx);
  await seedInvoices(orderCtx.created);
  await seedReturnsAndClaims(orderCtx);
  console.log(`\nDone. Demo password for all users: ${DEMO_PASSWORD}`);
  console.log("Admins: admin@royalshop.test, founder@royalshop.test");
  console.log("Customers: jana.kovacova@example.sk, peter.horvath@example.sk, nakup@stavbyvajda.example.sk");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
