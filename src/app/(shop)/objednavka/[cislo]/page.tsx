import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Check, CreditCard, Lock, Store, Truck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { payOrder } from "@/lib/checkout-actions";
import { confirmCheckoutReturn } from "@/lib/orders";
import { isDemoPayments } from "@/lib/stripe";
import { formatEur } from "@/lib/money";
import { formatDeliveryDate } from "@/lib/format";
import { ORDER_STATUS_LABELS, timelineFor, type OrderStatus, type ShippingMethod } from "@/lib/order-state";
import { ClearCart } from "@/components/shop/clear-cart";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Objednávka", robots: { index: false, follow: false } };

const METHOD_LABEL: Record<ShippingMethod, string> = {
  courier: "Kuriér na adresu",
  own_transport: "Vlastný rozvoz",
  pickup_senec: "Osobný odber Senec",
};

interface Address {
  name: string;
  contact?: string;
  street: string;
  city: string;
  zip: string;
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function OrderView({ params, searchParams }: PageProps<"/objednavka/[cislo]">) {
  const [{ cislo }, sp] = await Promise.all([params, searchParams]);
  const token = first(sp.t);
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();

  const db = createAdminClient();
  const load = () =>
    db
      .from("orders")
      .select(
        `id, order_number, access_token, status, payment_status, customer_type, email, phone, billing, shipping_address,
         company, shipping_method, shipping_price_cents, subtotal_gross_cents, total_net_cents, total_vat_cents,
         total_gross_cents, estimated_delivery_date, created_at,
         items:order_items(name, sku, quantity, unit_price_gross_cents, line_gross_cents)`,
      )
      .eq("order_number", decodeURIComponent(cislo))
      .eq("access_token", token)
      .maybeSingle();

  let { data: order } = await load();
  if (!order) notFound();

  const sessionId = first(sp.session_id);
  if (order.status === "pending_payment" && sessionId) {
    await confirmCheckoutReturn(db, order.id, sessionId);
    ({ data: order } = await load());
    if (!order) notFound();
  }

  const status = order.status as OrderStatus;
  const method = order.shipping_method as ShippingMethod;
  const isNew = first(sp.novy) === "1";
  const paymentCancelled = first(sp.platba) === "zrusena" && status === "pending_payment";
  const billing = order.billing as Address;
  const shipping = order.shipping_address as Address | null;
  const company = order.company as { name: string; ico: string; dic: string; ic_dph: string | null } | null;
  const items = order.items as {
    name: string;
    sku: string | null;
    quantity: number;
    unit_price_gross_cents: number;
    line_gross_cents: number;
  }[];
  const steps = timelineFor(method);
  const reached = status === "cancelled" ? -1 : steps.indexOf(status);
  const eta = order.estimated_delivery_date
    ? formatDeliveryDate(new Date(`${order.estimated_delivery_date}T12:00:00Z`))
    : null;

  return (
    <>
      {isNew && <ClearCart />}
      <header className={css.pageHead}>
        <p className={css.tape}>Objednávka {order.order_number}</p>
        <h1 className={css.pageTitle}>
          {isNew && status !== "cancelled" ? "Ďakujeme za objednávku" : "Stav objednávky"}
        </h1>
        <p className={css.pageLede}>
          Objednávka je zaevidovaná na <strong>{order.email}</strong>. Odkaz na túto stránku si uložte, stav objednávky
          na nej uvidíte aj neskôr.
        </p>
      </header>

      <div className={css.orderLayout}>
        <div className={css.orderMain}>
          {status === "pending_payment" && (
            <section className={css.payBox} aria-labelledby="pay-title">
              {paymentCancelled && (
                <p className={css.notice}>
                  <AlertTriangle size={18} aria-hidden="true" /> Platbu ste zrušili. Objednávka čaká na zaplatenie.
                </p>
              )}
              <h2 id="pay-title" className={css.payTitle}>
                <CreditCard size={24} aria-hidden="true" /> Čaká na platbu
              </h2>
              <p>
                Suma <strong>{formatEur(order.total_gross_cents)}</strong> sa na karte len zablokuje. Strhneme ju, keď
                dodávateľ potvrdí dostupnosť tovaru.
              </p>
              <form action={payOrder}>
                <input type="hidden" name="number" value={order.order_number} />
                <input type="hidden" name="token" value={order.access_token} />
                <button type="submit" className={css.addBig}>
                  <Lock size={20} aria-hidden="true" />
                  {isDemoPayments ? "Zaplatiť (testovacia platba)" : "Zaplatiť kartou"}
                </button>
              </form>
              {isDemoPayments && (
                <p className={css.legalNote}>
                  Demo režim: platobná brána Stripe ešte nie je pripojená, tlačidlo platbu len nasimuluje.
                </p>
              )}
            </section>
          )}

          {status === "paid_authorized" && (
            <section className={`${css.testNote} ${css.dark}`} aria-label="Platba">
              <span className={css.testStamp} aria-hidden="true">
                <Check size={26} strokeWidth={3} />
              </span>
              <div>
                <p className={css.testTitle}>Platba autorizovaná</p>
                <p>
                  {formatEur(order.total_gross_cents)} máme na karte zablokovaných. Teraz overíme dostupnosť u
                  dodávateľa (zvyčajne do 1 pracovného dňa), potom platbu strhneme a pošleme faktúru.
                </p>
              </div>
            </section>
          )}

          {status === "cancelled" && (
            <p className={css.notice}>
              <AlertTriangle size={18} aria-hidden="true" /> Objednávka bola zrušená. Ak bola suma na karte zablokovaná,
              banka ju uvoľní.
            </p>
          )}

          {status !== "cancelled" && (
            <section aria-labelledby="timeline-title">
              <h2 id="timeline-title" className={css.proseTitle}>
                Priebeh
              </h2>
              <ol className={css.timeline}>
                {steps.map((s, i) => (
                  <li key={s} data-done={i <= reached || undefined} data-current={i === reached || undefined}>
                    <span className={css.timelineDot} aria-hidden="true">
                      {i <= reached ? <Check size={14} strokeWidth={3} /> : String(i + 1).padStart(2, "0")}
                    </span>
                    {ORDER_STATUS_LABELS[s]}
                    {i === reached && <span className={css.srOnly}> (aktuálny stav)</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <table className={css.specTable}>
            <caption>Položky</caption>
            <tbody>
              {items.map((i) => (
                <tr key={`${i.name}-${i.sku}`}>
                  <th scope="row">
                    {i.quantity}× {i.sku ?? ""}
                  </th>
                  <td>
                    {i.name}
                    <span className={css.orderLinePrice}>{formatEur(i.line_gross_cents)}</span>
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row">{METHOD_LABEL[method]}</th>
                <td>
                  <span className={css.orderLinePrice}>
                    {order.shipping_price_cents === 0 ? "zdarma" : formatEur(order.shipping_price_cents)}
                  </span>
                </td>
              </tr>
              <tr>
                <th scope="row">DPH v cene</th>
                <td>
                  <span className={css.orderLinePrice}>{formatEur(order.total_vat_cents)}</span>
                </td>
              </tr>
              <tr>
                <th scope="row">Celkom s DPH</th>
                <td>
                  <strong className={css.orderLinePrice}>{formatEur(order.total_gross_cents)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <aside className={css.gpsr} aria-label="Údaje objednávky">
          <p className={css.gpsrHead}>
            {method === "pickup_senec" ? (
              <Store size={18} aria-hidden="true" />
            ) : (
              <Truck size={18} aria-hidden="true" />
            )}{" "}
            {METHOD_LABEL[method]}
          </p>
          <dl className={css.gpsrList}>
            {eta && (
              <div>
                <dt>{method === "pickup_senec" ? "Pripravené na odber" : "Predpokladané doručenie"}</dt>
                <dd>{eta}</dd>
              </div>
            )}
            {shipping && (
              <div>
                <dt>Doručiť na</dt>
                <dd>
                  {shipping.name}
                  <br />
                  {shipping.street}, {shipping.zip} {shipping.city}
                </dd>
              </div>
            )}
            <div>
              <dt>Fakturačné údaje</dt>
              <dd>
                {billing.name}
                <br />
                {billing.street}, {billing.zip} {billing.city}
                {company && (
                  <>
                    <br />
                    IČO {company.ico} · DIČ {company.dic}
                    {company.ic_dph && ` · IČ DPH ${company.ic_dph}`}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>Kontakt</dt>
              <dd>
                {order.email}
                {order.phone && (
                  <>
                    <br />
                    {order.phone}
                  </>
                )}
              </dd>
            </div>
          </dl>
          <Link href="/produkty" className={css.gpsrLink}>
            Pokračovať v nákupe
          </Link>
        </aside>
      </div>
    </>
  );
}

export default function OrderPage(props: PageProps<"/objednavka/[cislo]">) {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <Suspense fallback={<p className={css.resultCount}>Načítavam objednávku…</p>}>
        <OrderView {...props} />
      </Suspense>
    </div>
  );
}
