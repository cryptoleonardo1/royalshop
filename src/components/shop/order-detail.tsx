import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, Check, CreditCard, FileText, Lock, MessageCircle, Package, Phone, Store, Truck, Undo2 } from "lucide-react";
import { payOrder } from "@/lib/checkout-actions";
import { isDemoPayments } from "@/lib/stripe";
import { formatEur } from "@/lib/money";
import { formatDate, formatDateTime, formatDeliveryDate, whatsappUrl } from "@/lib/format";
import { ORDER_STATUS_LABELS, timelineFor, type ShippingMethod } from "@/lib/order-state";
import type { OrderDetail } from "@/lib/order-detail";
import { RETURN_STATUS_CUSTOMER } from "@/lib/returns";
import { withdrawalEligibility } from "@/lib/withdrawal";
import css from "./shop.module.css";

// Order body shared by the guest order page and the account portal: payment box, timeline with dates,
// shipment tracking, items and the side panel with addresses and a WhatsApp contact.

export const METHOD_LABEL: Record<ShippingMethod, string> = {
  courier: "Kuriér na adresu",
  own_transport: "Vlastný rozvoz",
  pickup_senec: "Osobný odber v predajni",
};

export function OrderDetailView({
  order,
  shopPhone,
  paymentCancelled = false,
  aside,
  children,
}: {
  order: OrderDetail;
  shopPhone: string | null;
  paymentCancelled?: boolean;
  // extra block at the bottom of the side panel (e.g. "save to my account")
  aside?: ReactNode;
  // extra sections under the timeline (e.g. withdrawal)
  children?: ReactNode;
}) {
  const { status, shippingMethod: method, billing, shippingAddress: shipping, company } = order;
  const steps = timelineFor(method);
  const reached = status === "cancelled" ? -1 : steps.indexOf(status);
  const eta = order.estimatedDeliveryDate
    ? formatDeliveryDate(new Date(`${order.estimatedDeliveryDate}T12:00:00Z`))
    : null;

  return (
    <div className={css.orderLayout}>
      <div className={css.orderMain}>
        {status === "reserved" && (
          <section className={`${css.testNote} ${css.dark}`} aria-label="Rezervácia">
            <span className={css.testStamp} aria-hidden="true">
              <Phone size={24} strokeWidth={2.5} />
            </span>
            <div>
              <p className={css.testTitle}>Rezervácia prijatá</p>
              <p>
                Ďakujeme. Rezervácia je nezáväzná a zatiaľ nič neplatíte. Do 1 pracovného dňa vám zavoláme na{" "}
                {order.phone ?? "vaše telefónne číslo"}, overíme dostupnosť stroja a dohodneme ďalší postup: kúpu
                osobne v našej predajni v Boldogu pri Senci (s vyskúšaním a zaškolením), alebo platbu kartou cez
                odkaz. Ak si to rozmyslíte, stačí nám dať vedieť.
              </p>
            </div>
          </section>
        )}

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
              Celú sumu <strong>{formatEur(order.totalGrossCents)}</strong> zaplatíte vopred. Objednávku potvrdíme
              e-mailom, keď dodávateľ potvrdí dostupnosť. Ak stroj nebude dostupný, peniaze vám vrátime.
            </p>
            {order.customerType === "person" && (
              <p className={css.legalNote}>
                Platbou uzatvárate kúpnu zmluvu na diaľku podľa{" "}
                <Link href="/obchodne-podmienky">obchodných podmienok</Link>. Ako spotrebiteľ môžete od nej odstúpiť
                do 14 dní od prevzatia stroja bez udania dôvodu, pozrite si{" "}
                <Link href="/odstupenie-od-zmluvy">poučenie o odstúpení od zmluvy</Link>.
              </p>
            )}
            <form action={payOrder}>
              <input type="hidden" name="number" value={order.orderNumber} />
              <input type="hidden" name="token" value={order.accessToken} />
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

        {status === "paid" && (
          <section className={`${css.testNote} ${css.dark}`} aria-label="Platba">
            <span className={css.testStamp} aria-hidden="true">
              <Check size={26} strokeWidth={3} />
            </span>
            <div>
              <p className={css.testTitle}>Zaplatené</p>
              <p>
                Platbu {formatEur(order.totalGrossCents)} sme prijali. Teraz overíme dostupnosť u dodávateľa (zvyčajne
                do 1 pracovného dňa) a pošleme vám potvrdenie objednávky. Ak stroj nebude dostupný, celú sumu vám
                vrátime.
              </p>
            </div>
          </section>
        )}

        {status === "cancelled" && (
          <p className={css.notice}>
            <AlertTriangle size={18} aria-hidden="true" />{" "}
            {order.reservedAt && !order.paid
              ? "Rezervácia bola zrušená."
              : "Objednávka bola zrušená. Ak ste už zaplatili, celú sumu vám vrátime tým istým spôsobom, akým ste platili."}
          </p>
        )}

        {status !== "cancelled" && (
          <section aria-labelledby="timeline-title">
            <h2 id="timeline-title" className={css.proseTitle}>
              Priebeh
            </h2>
            <ol className={css.timeline}>
              {steps.map((s, i) => {
                const at = i <= reached ? order.reachedAt[s] : undefined;
                return (
                  <li key={s} data-done={i <= reached || undefined} data-current={i === reached || undefined}>
                    <span className={css.timelineDot} aria-hidden="true">
                      {i <= reached ? <Check size={14} strokeWidth={3} /> : String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      {ORDER_STATUS_LABELS[s]}
                      {at && <span className={css.timelineAt}>{formatDateTime(at)}</span>}
                    </span>
                    {i === reached && <span className={css.srOnly}> (aktuálny stav)</span>}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {order.shipments.length > 0 && (
          <section aria-labelledby="shipment-title">
            <h2 id="shipment-title" className={css.proseTitle}>
              Zásielka
            </h2>
            <ul className={css.shipments}>
              {order.shipments.map((s, i) => (
                <li key={i}>
                  <Package size={18} aria-hidden="true" />
                  <span>
                    {s.carrier}
                    {s.trackingNumber && <> · číslo zásielky {s.trackingNumber}</>}
                  </span>
                  {s.trackingUrl && (
                    <a href={s.trackingUrl} target="_blank" rel="noopener noreferrer">
                      Sledovať zásielku
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {order.documents.length > 0 && (
          <section aria-labelledby="documents-title">
            <h2 id="documents-title" className={css.proseTitle}>
              Faktúry
            </h2>
            <ul className={css.shipments}>
              {order.documents.map((d) => (
                <li key={d.id}>
                  <FileText size={18} aria-hidden="true" />
                  <span>
                    {d.creditNote ? "Dobropis" : "Faktúra"} {d.number} · {formatEur(d.totalGrossCents)}
                  </span>
                  <a
                    href={`/objednavka/${encodeURIComponent(order.orderNumber)}/doklad/${d.id}?t=${order.accessToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Stiahnuť PDF
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <WithdrawalPanel order={order} />

        {children}

        <table className={css.specTable}>
          <caption>Položky</caption>
          <tbody>
            {order.items.map((i) => (
              <tr key={`${i.name}-${i.sku}`}>
                <th scope="row">
                  {i.quantity}× {i.sku ?? ""}
                </th>
                <td>
                  {i.name}
                  <span className={css.orderLinePrice}>{formatEur(i.lineGrossCents)}</span>
                </td>
              </tr>
            ))}
            <tr>
              <th scope="row">{METHOD_LABEL[method]}</th>
              <td>
                <span className={css.orderLinePrice}>
                  {order.shippingPriceCents === 0 ? "zdarma" : formatEur(order.shippingPriceCents)}
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row">DPH v cene</th>
              <td>
                <span className={css.orderLinePrice}>{formatEur(order.totalVatCents)}</span>
              </td>
            </tr>
            <tr>
              <th scope="row">Celkom s DPH</th>
              <td>
                <strong className={css.orderLinePrice}>{formatEur(order.totalGrossCents)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside className={css.gpsr} aria-label="Údaje objednávky">
        <p className={css.gpsrHead}>
          {method === "pickup_senec" ? <Store size={18} aria-hidden="true" /> : <Truck size={18} aria-hidden="true" />}{" "}
          {METHOD_LABEL[method]}
        </p>
        <dl className={css.gpsrList}>
          {eta && status !== "cancelled" && !order.deliveredAt && (
            <div>
              <dt>{method === "pickup_senec" ? "Pripravené na odber" : "Predpokladané doručenie"}</dt>
              <dd>{eta}</dd>
            </div>
          )}
          {order.deliveredAt && (
            <div>
              <dt>{method === "pickup_senec" ? "Prevzaté" : "Doručené"}</dt>
              <dd>{formatDateTime(order.deliveredAt)}</dd>
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
        {shopPhone && (
          <a
            href={whatsappUrl(shopPhone, `Dobrý deň, píšem ohľadom objednávky ${order.orderNumber}.`)}
            className={css.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={20} aria-hidden="true" />
            <span>
              Napísať na WhatsApp
              <small>Otázka k objednávke {order.orderNumber}</small>
            </span>
          </a>
        )}
        {aside}
        <Link href="/produkty" className={css.gpsrLink}>
          Pokračovať v nákupe
        </Link>
      </aside>
    </div>
  );
}

// Slovak plural: 1 deň, 2–4 dni, 5+ dní
const daysText = (n: number) => `${n} ${n === 1 ? "deň" : n >= 2 && n <= 4 ? "dni" : "dní"}`;

// Withdrawal (docs/04 §4.3): filed withdrawals with their status, and while the consumer may still withdraw
// the "Odstúpiť od zmluvy tu" button with the countdown; after the deadline the date it ended.
function WithdrawalPanel({ order }: { order: OrderDetail }) {
  const e = withdrawalEligibility({
    customer_type: order.customerType,
    status: order.status,
    delivered_at: order.deliveredAt,
    withdrawal_deadline: order.withdrawalDeadline,
    contract_place: order.contractPlace,
  });
  const wholeDone = order.returns.some((r) => r.status !== "rejected" && r.wholeOrder);
  const offer = e.allowed && !wholeDone;
  const expired = e.block === "expired" && order.returns.length === 0;
  if (order.returns.length === 0 && !offer && !expired) return null;
  const formHref = `/odstupenie-od-zmluvy?objednavka=${encodeURIComponent(order.orderNumber)}&t=${order.accessToken}#formular`;

  return (
    <section aria-labelledby="withdraw-title">
      <h2 id="withdraw-title" className={css.proseTitle}>
        Odstúpenie od zmluvy
      </h2>
      <div className={css.withdrawPanel}>
        {order.returns.length > 0 && (
          <ul>
            {order.returns.map((r) => (
              <li key={r.returnNumber}>
                <strong>{r.returnNumber}</strong>
                <span>odoslané {formatDateTime(r.submittedAt)}</span>
                <span>· {RETURN_STATUS_CUSTOMER[r.status]}</span>
                {r.refundedAt && r.refundCents != null && (
                  <span>
                    · vrátené {formatEur(r.refundCents)} dňa {formatDate(r.refundedAt)}
                  </span>
                )}
                <Link href={`/odstupenie-od-zmluvy/potvrdenie/${encodeURIComponent(r.returnNumber)}?t=${r.accessToken}`}>
                  Potvrdenie
                </Link>
              </li>
            ))}
          </ul>
        )}
        {offer && (
          <>
            <p>
              {e.deadline
                ? `Od zmluvy môžete odstúpiť bez udania dôvodu do ${formatDate(e.deadline.toISOString())} (${
                    e.daysLeft === 0 ? "dnes je posledný deň" : `ešte ${daysText(e.daysLeft ?? 0)}`
                  }).`
                : "Od zmluvy môžete odstúpiť už teraz, bez udania dôvodu. 14-dňová lehota sa začne dňom prevzatia stroja."}
              {order.returns.length > 0 && " Formulár ponúkne tovar, od ktorého ste ešte neodstúpili."}
            </p>
            <Link href={formHref} className={css.btnGhost}>
              <Undo2 size={18} aria-hidden="true" /> Odstúpiť od zmluvy tu
            </Link>
          </>
        )}
        {e.block === "expired" && e.deadline && (
          <p>Lehota na odstúpenie od zmluvy uplynula dňa {formatDate(e.deadline.toISOString())}.</p>
        )}
      </div>
    </section>
  );
}
