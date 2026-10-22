"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopSettings } from "@/lib/catalog";
import { buildQuote, type Quote } from "@/lib/cart-pricing";
import { cartLinesSchema, orderSnapshots, parseCheckout, type FieldErrors } from "@/lib/checkout-schema";
import type { ShippingMethod } from "@/lib/order-state";
import { fetchPricedProducts, markPaymentAuthorized } from "@/lib/orders";
import { isDemoPayments, stripe } from "@/lib/stripe";

// Every write here touches money or order state, so it runs server-side with the service role.

const TERMS_FALLBACK_VERSION = "demo-1";

async function siteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function quoteFor(lines: { slug: string; quantity: number }[], method?: ShippingMethod | null) {
  const db = createAdminClient();
  const [products, settings] = await Promise.all([
    fetchPricedProducts(
      db,
      lines.map((l) => l.slug),
    ),
    getShopSettings(),
  ]);
  return { quote: buildQuote({ lines, products, settings, method }), products };
}

// Read-only: prices the browser cart for the cart page and the checkout summary.
export async function quoteCart(rawLines: unknown, method?: ShippingMethod | null): Promise<Quote | null> {
  const parsed = cartLinesSchema.safeParse(rawLines);
  if (!parsed.success) return null;
  const { quote } = await quoteFor(parsed.data, method);
  return quote;
}

export type PlaceOrderState = { errors?: FieldErrors; message?: string } | undefined;

export async function placeOrder(_prev: PlaceOrderState, form: FormData): Promise<PlaceOrderState> {
  const parsed = parseCheckout(form);
  if (!parsed.ok) return { errors: parsed.errors, message: "Skontrolujte zvýraznené polia." };
  const input = parsed.data;

  const { quote, products } = await quoteFor(input.lines, input.shippingMethod);
  if (quote.missing.length > 0 || quote.lines.length === 0) {
    return { message: "Niektoré produkty v košíku už nepredávame. Vráťte sa do košíka a skontrolujte ho." };
  }
  if (quote.method !== input.shippingMethod) {
    return { errors: { shippingMethod: "Tento spôsob dopravy nie je pre váš košík dostupný." } };
  }

  const db = createAdminClient();
  const [{ data: orderNumber, error: numberError }, terms] = await Promise.all([
    db.rpc("next_document_number", { p_kind: "order" }),
    db
      .from("legal_documents")
      .select("version")
      .eq("type", input.customerType === "company" ? "terms_b2b" : "terms_b2c")
      .lte("valid_from", new Date().toISOString())
      .order("valid_from", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (numberError || !orderNumber) throw new Error(`Order number failed: ${numberError?.message}`);

  const { billing, company, shipping } = orderSnapshots(input);
  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_type: input.customerType,
      email: input.email,
      phone: input.phone,
      billing,
      shipping_address: shipping,
      company,
      shipping_method: quote.method,
      shipping_price_cents: quote.shippingCents,
      subtotal_gross_cents: quote.subtotalGrossCents,
      total_net_cents: quote.totals.netCents,
      total_vat_cents: quote.totals.vatCents,
      total_gross_cents: quote.totals.grossCents,
      estimated_delivery_date: quote.estimatedDelivery,
      terms_version: terms.data?.version ?? TERMS_FALLBACK_VERSION,
      terms_accepted_at: new Date().toISOString(),
      customer_note: input.note ?? null,
    })
    .select("id, order_number, access_token")
    .single();
  if (orderError) throw new Error(`Order insert failed: ${orderError.message}`);

  const items = quote.lines.map((l) => {
    const p = products.get(l.product.slug)!;
    return {
      order_id: order.id,
      product_id: p.id,
      name: p.name,
      sku: p.sku,
      ean: p.ean ?? null,
      supplier_id: p.supplierId ?? null,
      quantity: l.quantity,
      unit_price_gross_cents: p.priceGrossCents,
      vat_rate: p.vatRate,
      line_net_cents: l.lineNetCents,
      line_vat_cents: l.lineVatCents,
      line_gross_cents: l.lineGrossCents,
      purchase_price_net_cents: p.purchaseNetCents,
    };
  });
  const itemsResult = await db.from("order_items").insert(items);
  if (itemsResult.error) {
    await db.from("orders").delete().eq("id", order.id);
    throw new Error(`Order items insert failed: ${itemsResult.error.message}`);
  }
  await db
    .from("order_status_history")
    .insert({ order_id: order.id, from_status: null, to_status: "pending_payment", note: "Objednávka vytvorená" });

  const url = await startPayment(order.id);
  redirect(url);
}

// Creates a Stripe Checkout session (manual capture) for a pending order and returns where to send
// the customer. In demo payment mode it returns the order page, which offers a simulated payment.
async function startPayment(orderId: string): Promise<string> {
  const db = createAdminClient();
  const { data: order, error } = await db
    .from("orders")
    .select(
      "id, order_number, access_token, email, status, shipping_method, shipping_price_cents, total_gross_cents, items:order_items(name, sku, quantity, unit_price_gross_cents)",
    )
    .eq("id", orderId)
    .single();
  if (error) throw new Error(`Order ${orderId}: load failed: ${error.message}`);
  const base = await siteUrl();
  const orderUrl = `${base}/objednavka/${order.order_number}?t=${order.access_token}`;
  if (order.status !== "pending_payment" || !stripe) return `${orderUrl}&novy=1`;

  const lineItems = (
    order.items as { name: string; sku: string | null; quantity: number; unit_price_gross_cents: number }[]
  ).map((i) => ({
    quantity: i.quantity,
    price_data: {
      currency: "eur",
      unit_amount: i.unit_price_gross_cents,
      product_data: { name: i.name, ...(i.sku ? { description: `Kód ${i.sku}` } : {}) },
    },
  }));
  if (order.shipping_price_cents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: order.shipping_price_cents,
        product_data: {
          name: "Doprava na adresu",
        },
      },
    });
  }
  const sum = lineItems.reduce((s, l) => s + l.price_data.unit_amount * l.quantity, 0);
  if (sum !== order.total_gross_cents)
    throw new Error(`Order ${order.id}: Stripe total ${sum} ≠ order total ${order.total_gross_cents}`);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "sk",
    customer_email: order.email,
    line_items: lineItems,
    client_reference_id: order.id,
    metadata: { order_id: order.id, order_number: order.order_number },
    payment_intent_data: {
      capture_method: "manual",
      metadata: { order_id: order.id, order_number: order.order_number },
      description: `Objednávka ${order.order_number}`,
    },
    success_url: `${orderUrl}&novy=1&platba=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${orderUrl}&novy=1&platba=zrusena`,
  });
  const pay = await db.from("payments").insert({
    order_id: order.id,
    provider: "stripe",
    stripe_checkout_session_id: session.id,
    amount_cents: order.total_gross_cents,
    status: "pending",
  });
  if (pay.error) throw new Error(`Payment insert failed: ${pay.error.message}`);
  if (!session.url) throw new Error("Stripe returned no checkout URL");
  return session.url;
}

async function loadOrderByToken(orderNumber: string, token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const db = createAdminClient();
  const { data } = await db
    .from("orders")
    .select("id, order_number, access_token, status, total_gross_cents")
    .eq("order_number", orderNumber)
    .eq("access_token", token)
    .maybeSingle();
  return data;
}

// "Zaplatiť" on the order page: a fresh Stripe session, or the simulated authorization in demo mode.
export async function payOrder(form: FormData): Promise<void> {
  const number = String(form.get("number") ?? "");
  const token = String(form.get("token") ?? "");
  const order = await loadOrderByToken(number, token);
  if (!order) redirect("/");
  const orderPath = `/objednavka/${order.order_number}?t=${order.access_token}`;
  if (order.status !== "pending_payment") redirect(orderPath);

  if (isDemoPayments) {
    const db = createAdminClient();
    const sessionId = `demo_${order.id}_${Date.now()}`;
    const pay = await db.from("payments").insert({
      order_id: order.id,
      provider: "stripe",
      stripe_checkout_session_id: sessionId,
      amount_cents: order.total_gross_cents,
      status: "pending",
    });
    if (pay.error) throw new Error(`Demo payment insert failed: ${pay.error.message}`);
    await markPaymentAuthorized(
      db,
      order.id,
      { checkoutSessionId: sessionId, paymentIntentId: null },
      "Testovacia platba (demo režim bez Stripe)",
    );
    redirect(`${orderPath}&platba=ok`);
  }
  redirect(await startPayment(order.id));
}
