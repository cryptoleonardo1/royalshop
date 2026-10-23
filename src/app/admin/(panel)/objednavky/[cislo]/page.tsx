import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderDetail } from "@/lib/admin/orders-data";
import { formatEur } from "@/lib/money";
import { allowedNextStatuses, ORDER_STATUS_LABELS, type OrderStatus, type ShippingMethod } from "@/lib/order-state";
import { canCompleteOrder, WITHDRAWAL_POST_GRACE_DAYS } from "@/lib/withdrawal";
import { LiveOrders } from "@/components/admin/live-orders";
import { AdminNote, CancelOrder, NextSteps } from "@/components/admin/order-actions";
import { daysText, fmtDate, fmtDateTime, PaymentBadge, StatusBadge, WINDOW_TONE, WindowBadge } from "@/components/admin/badges";
import css from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "Objednávka" };

const METHOD_LABEL: Record<ShippingMethod, string> = {
  courier: "Kuriér na adresu",
  own_transport: "Vlastný rozvoz",
  pickup_senec: "Osobný odber (Boldog)",
};

interface Address {
  name: string;
  contact?: string;
  street: string;
  city: string;
  zip: string;
}

// payments.status (Stripe side of one payment attempt)
const PAYMENT_STATUS: Record<string, string> = {
  pending: "čaká na platbu",
  authorized: "zablokovaná na karte",
  captured: "zaplatená",
  cancelled: "zrušená",
  failed: "zlyhala",
  partially_refunded: "čiastočne vrátená",
  refunded: "vrátená",
};

const stripeDashboard = (pi: string) =>
  `https://dashboard.stripe.com/${process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "" : "test/"}payments/${pi}`;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function OrderDetail({ params }: PageProps<"/admin/objednavky/[cislo]">) {
  const { cislo } = await params;
  const detail = await getOrderDetail(decodeURIComponent(cislo));
  if (!detail) notFound();
  const { order: o, row, authorName } = detail;
  const status = o.status as OrderStatus;
  const method = o.shipping_method as ShippingMethod;
  const billing = o.billing as Address;
  const shipping = o.shipping_address as Address | null;
  const company = o.company as { name: string; ico: string; dic: string; ic_dph: string | null } | null;
  const items = o.items as any[];
  const history = [...(o.history as any[])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const payments = o.payments as any[];
  const w = row.withdrawal;

  const purchaseKnown = items.every((i) => i.purchase_price_net_cents != null);
  const next = allowedNextStatuses(status, method);
  const completeBlocked = canCompleteOrder({ customer_type: o.customer_type, status, delivered_at: o.delivered_at, withdrawal_deadline: o.withdrawal_deadline, hasWithdrawal: w.window === "withdrawn" })
    ? undefined
    : `Uzavrieť sa dá až po lehote na odstúpenie a ${WITHDRAWAL_POST_GRACE_DAYS} dňoch rezervy na poštu.`;
  const paidCents = payments.filter((p) => ["captured", "partially_refunded"].includes(p.status)).reduce((s, p) => s + p.amount_cents - (p.refunded_cents ?? 0), 0);
  const heldCents = payments.filter((p) => p.status === "authorized").reduce((s, p) => s + p.amount_cents, 0);
  const refundText =
    heldCents > 0
      ? `Blokácia ${formatEur(heldCents)} na karte zákazníka sa uvoľní, nič sa nestiahne.`
      : paidCents > 0
      ? `Zákazníkovi sa hneď vráti ${formatEur(paidCents)} na kartu (celá suma vrátane dopravy). Podľa VOP do 2 pracovných dní.`
      : "Objednávka nie je zaplatená, nič sa nevracia. Otvorená platba sa zruší.";

  const riskText: Record<string, string> = {
    none: status === "cancelled" ? "Objednávka je zrušená." : "Objednávka ešte nie je zaplatená, zmluva nevznikla.",
    company: "Firemný zákazník: zákonné odstúpenie do 14 dní sa nevzťahuje.",
    before_delivery: "Spotrebiteľ môže odstúpiť už teraz. 14-dňová lehota sa začne dňom prevzatia stroja.",
    open: `Spotrebiteľ môže odstúpiť do ${fmtDateTime(w.deadline)} (${w.daysLeft === 0 ? "dnes je posledný deň" : `ešte ${daysText(w.daysLeft ?? 0)}`}). Stačí, ak odstúpenie v lehote odošle.`,
    grace: `Lehota uplynula ${fmtDateTime(w.deadline)}. Odstúpenie odoslané poštou v posledný deň môže ešte prísť, preto ${WITHDRAWAL_POST_GRACE_DAYS} dní rezerva.`,
    closed: `Lehota uplynula ${fmtDateTime(w.deadline)}. Odstúpenie už nie je možné, ostávajú iba reklamácie.`,
    withdrawn: "Zákazník od zmluvy odstúpil. Vybavenie bude v module Odstúpenia.",
  };

  return (
    <>
      <header className={css.head}>
        <div>
          <Link href="/admin/objednavky" className={css.back}>
            ← Objednávky
          </Link>
          <h1 className={css.title}>
            {o.order_number} <StatusBadge status={status} /> <PaymentBadge status={o.payment_status} />
          </h1>
          <p className={css.sub}>
            Vytvorená {fmtDateTime(o.created_at)} · {o.customer_type === "company" ? "Firma" : "Spotrebiteľ"} · {METHOD_LABEL[method]}
          </p>
        </div>
        <LiveOrders />
      </header>

      <div className={css.detail}>
        <div className={css.stack}>
          <div className={css.risk} data-tone={WINDOW_TONE[w.window]}>
            <p className={css.riskTitle}>
              Odstúpenie: <WindowBadge info={w} />
            </p>
            <p className={css.riskText}>{riskText[w.window]}</p>
            {row.deliveryLimit && (
              <p className={css.riskText} style={{ marginTop: 6 }}>
                Záväzná dodacia lehota: doručiť najneskôr <strong>{fmtDate(row.deliveryLimit)}</strong> (10 pracovných dní od zaplatenia).
              </p>
            )}
          </div>

          <section className={css.panel}>
            <div className={css.panelHead}>
              <h2 className={css.panelTitle}>Položky</h2>
            </div>
            <div className={css.tableWrap} style={{ border: 0 }}>
              <table className={css.table}>
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th className={css.num}>Ks</th>
                    <th className={css.num}>Cena s DPH</th>
                    <th className={css.num}>Spolu s DPH</th>
                    <th className={css.num}>Nákup bez DPH</th>
                    <th className={css.num}>Marža bez DPH</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td className={css.wrapCell}>
                        {i.name}
                        <div className={`${css.muted} ${css.small}`}>
                          {i.sku ?? "bez kódu"}
                          {i.supplier?.name && ` · ${i.supplier.name}`}
                          {i.serial_number && ` · v. č. ${i.serial_number}`}
                        </div>
                      </td>
                      <td className={css.num}>{i.quantity}</td>
                      <td className={css.num}>{formatEur(i.unit_price_gross_cents)}</td>
                      <td className={css.num}>{formatEur(i.line_gross_cents)}</td>
                      <td className={css.num}>{i.purchase_price_net_cents == null ? "–" : formatEur(i.purchase_price_net_cents * i.quantity)}</td>
                      <td className={css.num}>
                        {i.purchase_price_net_cents == null ? "–" : formatEur(i.line_net_cents - i.purchase_price_net_cents * i.quantity)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3}>Doprava ({METHOD_LABEL[method]})</td>
                    <td className={css.num}>{o.shipping_price_cents === 0 ? "zdarma" : formatEur(o.shipping_price_cents)}</td>
                    <td colSpan={2} />
                  </tr>
                  <tr>
                    <td colSpan={3}>
                      <strong>Celkom</strong> <span className={css.muted}>(bez DPH {formatEur(o.total_net_cents)}, DPH {formatEur(o.total_vat_cents)})</span>
                    </td>
                    <td className={css.num}>
                      <strong>{formatEur(o.total_gross_cents)}</strong>
                    </td>
                    <td />
                    <td className={css.num}>
                      <strong>{row.marginNetCents == null ? "–" : formatEur(row.marginNetCents)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {!purchaseKnown && <p className={`${css.empty} ${css.small}`}>Pri niektorej položke chýba nákupná cena, marža sa nedá spočítať.</p>}
          </section>

          <div className={css.grid2}>
            <section className={css.panel}>
              <div className={css.panelHead}>
                <h2 className={css.panelTitle}>Zákazník</h2>
              </div>
              <div className={css.panelBody}>
                <dl className={css.dl}>
                  <dt>Fakturácia</dt>
                  <dd>
                    {billing.name}
                    <br />
                    {billing.street}, {billing.zip} {billing.city}
                  </dd>
                  {company && (
                    <>
                      <dt>Firma</dt>
                      <dd>
                        {company.name}
                        <br />
                        IČO {company.ico} · DIČ {company.dic}
                        {company.ic_dph && ` · IČ DPH ${company.ic_dph}`}
                      </dd>
                    </>
                  )}
                  {shipping && (
                    <>
                      <dt>Doručenie</dt>
                      <dd>
                        {shipping.name}
                        {shipping.contact && ` (${shipping.contact})`}
                        <br />
                        {shipping.street}, {shipping.zip} {shipping.city}
                      </dd>
                    </>
                  )}
                  <dt>E-mail</dt>
                  <dd>
                    <a href={`mailto:${o.email}`}>{o.email}</a>
                  </dd>
                  {o.phone && (
                    <>
                      <dt>Telefón</dt>
                      <dd>
                        <a href={`tel:${o.phone}`}>{o.phone}</a>
                      </dd>
                    </>
                  )}
                  {o.customer_note && (
                    <>
                      <dt>Poznámka</dt>
                      <dd>{o.customer_note}</dd>
                    </>
                  )}
                  <dt>Podmienky</dt>
                  <dd>
                    verzia {o.terms_version ?? "–"}, prijaté {fmtDateTime(o.terms_accepted_at)}
                  </dd>
                </dl>
              </div>
            </section>

            <section className={css.panel}>
              <div className={css.panelHead}>
                <h2 className={css.panelTitle}>Platby a doprava</h2>
              </div>
              <div className={css.panelBody}>
                <dl className={css.dl}>
                  {payments.length === 0 && (
                    <>
                      <dt>Platba</dt>
                      <dd>žiadna</dd>
                    </>
                  )}
                  {payments.map((p) => (
                    <div key={p.id} style={{ display: "contents" }}>
                      <dt>{p.provider === "stripe" ? "Karta (Stripe)" : p.provider}</dt>
                      <dd>
                        {formatEur(p.amount_cents)} · {PAYMENT_STATUS[p.status] ?? p.status}
                        {p.refunded_cents > 0 && ` · vrátené ${formatEur(p.refunded_cents)}`}
                        {p.captured_at && <div className={`${css.muted} ${css.small}`}>zaplatené {fmtDateTime(p.captured_at)}</div>}
                        {!p.captured_at && p.authorized_at && (
                          <div className={`${css.muted} ${css.small}`}>zablokované {fmtDateTime(p.authorized_at)}, stiahne sa pri potvrdení</div>
                        )}
                        {p.stripe_payment_intent_id?.startsWith("pi_") && (
                          <div className={css.small}>
                            <a href={stripeDashboard(p.stripe_payment_intent_id)} target="_blank" rel="noreferrer">
                              Otvoriť v Stripe
                            </a>
                          </div>
                        )}
                      </dd>
                    </div>
                  ))}
                  {(o.supplier_orders as any[]).map((s, idx) => (
                    <div key={`so-${idx}`} style={{ display: "contents" }}>
                      <dt>Dodávateľ</dt>
                      <dd>
                        {s.supplier?.name}
                        {s.reference && ` · ${s.reference}`}
                        <div className={`${css.muted} ${css.small}`}>
                          objednané {fmtDate(s.ordered_at)}
                          {s.expected_at && ` · očakávané ${fmtDate(s.expected_at)}`}
                          {s.received_at && ` · prijaté ${fmtDate(s.received_at)}`}
                        </div>
                      </dd>
                    </div>
                  ))}
                  {(o.shipments as any[]).map((s, idx) => (
                    <div key={`sh-${idx}`} style={{ display: "contents" }}>
                      <dt>Zásielka</dt>
                      <dd>
                        {s.carrier}
                        {s.tracking_number && ` · ${s.tracking_number}`}
                        {s.tracking_url && (
                          <>
                            {" · "}
                            <a href={s.tracking_url} target="_blank" rel="noreferrer">
                              sledovať
                            </a>
                          </>
                        )}
                        <div className={`${css.muted} ${css.small}`}>
                          odoslané {fmtDate(s.shipped_at)}
                          {s.delivered_at && ` · doručené ${fmtDate(s.delivered_at)}`}
                        </div>
                      </dd>
                    </div>
                  ))}
                  {o.estimated_delivery_date && (
                    <>
                      <dt>Odhad pri objednávke</dt>
                      <dd>{fmtDate(`${o.estimated_delivery_date}T12:00:00Z`)}</dd>
                    </>
                  )}
                </dl>
              </div>
            </section>
          </div>

          <section className={css.panel}>
            <div className={css.panelHead}>
              <h2 className={css.panelTitle}>História</h2>
            </div>
            <div className={css.panelBody}>
              <ol className={css.history}>
                {history.map((h) => (
                  <li key={h.id}>
                    <strong>{ORDER_STATUS_LABELS[h.to_status as OrderStatus] ?? h.to_status}</strong>{" "}
                    <span className={`${css.muted} ${css.small}`}>
                      {fmtDateTime(h.created_at)} · {h.changed_by ? (authorName.get(h.changed_by) ?? "admin") : "systém"}
                    </span>
                    {h.note && <div className={css.small}>{h.note}</div>}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>

        <aside className={css.stack}>
          <section className={css.panel}>
            <div className={css.panelHead}>
              <h2 className={css.panelTitle}>Ďalší krok</h2>
            </div>
            <div className={css.panelBody}>
              <NextSteps orderId={o.id} status={status} next={next} completeBlocked={completeBlocked} />
              {next.includes("cancelled") && <CancelOrder orderId={o.id} status={status} refundText={refundText} />}
            </div>
          </section>
          <section className={css.panel}>
            <div className={css.panelHead}>
              <h2 className={css.panelTitle}>Interná poznámka</h2>
            </div>
            <div className={css.panelBody}>
              <AdminNote orderId={o.id} note={o.admin_note} />
            </div>
          </section>
          {(o.invoices as any[]).length > 0 && (
            <section className={css.panel}>
              <div className={css.panelHead}>
                <h2 className={css.panelTitle}>Doklady</h2>
              </div>
              <div className={css.panelBody}>
                {(o.invoices as any[]).map((inv) => (
                  <div key={inv.invoice_number ?? inv.issue_date}>
                    {inv.type === "credit_note" ? "Dobropis" : "Faktúra"} {inv.invoice_number ?? "(koncept)"} · {formatEur(inv.total_gross_cents)}
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function OrderDetailPage(props: PageProps<"/admin/objednavky/[cislo]">) {
  return (
    <Suspense fallback={<p className={css.muted}>Načítavam objednávku…</p>}>
      <OrderDetail {...props} />
    </Suspense>
  );
}
