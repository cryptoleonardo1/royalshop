import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReturnDetail } from "@/lib/admin/returns-data";
import { formatEur } from "@/lib/money";
import { allowedReturnSteps, canRefund, RETURN_CHANNEL_LABELS, RETURN_DONE } from "@/lib/returns";
import { RefundForm, ReturnNote, ReturnSteps } from "@/components/admin/return-actions";
import { fmtDateTime, RefundDeadline, ReturnBadge, StatusBadge } from "@/components/admin/badges";
import css from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "Odstúpenie" };

async function ReturnDetail({ params }: PageProps<"/admin/odstupenia/[cislo]">) {
  const { cislo } = await params;
  const detail = await getReturnDetail(decodeURIComponent(cislo));
  if (!detail) notFound();
  const { ret: r, row, order, withdrawn, refundableCents, suggestedCents, createdByName } = detail;
  const done = RETURN_DONE.includes(row.status);
  const steps = allowedReturnSteps(row.status);

  return (
    <>
      <header className={css.head}>
        <div>
          <Link href="/admin/odstupenia" className={css.back}>
            ← Odstúpenia
          </Link>
          <h1 className={css.title}>
            {row.number} <ReturnBadge status={row.status} />
          </h1>
          <p className={css.sub}>
            Odoslané {fmtDateTime(row.submittedAt)} · {RETURN_CHANNEL_LABELS[row.channel]}
            {createdByName && ` (zapísal ${createdByName})`} · objednávka{" "}
            <Link href={`/admin/objednavky/${encodeURIComponent(order.number)}`}>{order.number}</Link>{" "}
            <StatusBadge status={order.status} />
          </p>
        </div>
      </header>

      <div className={css.detail}>
        <div className={css.stack}>
          <div className={css.risk} data-tone={done ? "green" : "red"}>
            <p className={css.riskTitle}>
              Vrátiť peniaze do {fmtDateTime(row.refundDeadline)} <RefundDeadline deadline={row.refundDeadline} days={row.refundDaysLeft} done={done} />
            </p>
            <p className={css.riskText}>
              {done
                ? row.refundCents != null
                  ? `Vybavené ${fmtDateTime(row.refundedAt)}, vrátené ${formatEur(row.refundCents)}.`
                  : "Vybavené."
                : order.deliveredAt
                  ? "S vrátením peňazí môžete počkať, kým stroj príde späť alebo kým zákazník preukáže jeho odoslanie (čo nastane skôr)."
                  : "Tovar ešte nebol doručený: nie je na čo čakať, vráťte peniaze a zastavte objednávku."}
            </p>
          </div>

          <section className={css.panel}>
            <div className={css.panelHead}>
              <h2 className={css.panelTitle}>Znenie odstúpenia</h2>
            </div>
            <div className={css.panelBody}>
              <p style={{ whiteSpace: "pre-line", margin: 0 }}>{r.notice_text ?? "–"}</p>
            </div>
          </section>

          <section className={css.panel}>
            <div className={css.panelHead}>
              <h2 className={css.panelTitle}>{row.wholeOrder ? "Celá objednávka" : "Vrátené položky"}</h2>
            </div>
            <div className={css.tableWrap} style={{ border: 0 }}>
              <table className={css.table}>
                <tbody>
                  {withdrawn.map((l) => (
                    <tr key={l.id}>
                      <td className={css.wrapCell}>
                        {l.quantity}× {l.name}
                        <div className={`${css.muted} ${css.small}`}>{l.sku ?? "bez kódu"}</div>
                      </td>
                      <td className={css.num}>{formatEur(l.lineGrossCents)}</td>
                    </tr>
                  ))}
                  {row.wholeOrder && (
                    <tr>
                      <td>Doprava</td>
                      <td className={css.num}>{order.shippingPriceCents === 0 ? "zdarma" : formatEur(order.shippingPriceCents)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={css.panel}>
            <div className={css.panelHead}>
              <h2 className={css.panelTitle}>Záznam</h2>
            </div>
            <div className={css.panelBody}>
              <dl className={css.dl}>
                <dt>Zákazník</dt>
                <dd>
                  {r.name} · <a href={`mailto:${r.email}`}>{r.email}</a>
                </dd>
                {r.reason && (
                  <>
                    <dt>Dôvod</dt>
                    <dd>{r.reason}</dd>
                  </>
                )}
                <dt>Odoslané</dt>
                <dd>{fmtDateTime(r.submitted_at)}</dd>
                {r.ip_address && (
                  <>
                    <dt>IP adresa</dt>
                    <dd className={css.mono}>{r.ip_address}</dd>
                  </>
                )}
                {r.user_agent && (
                  <>
                    <dt>Prehliadač</dt>
                    <dd className={css.small}>{r.user_agent}</dd>
                  </>
                )}
                {r.goods_received_at && (
                  <>
                    <dt>Tovar prijatý</dt>
                    <dd>{fmtDateTime(r.goods_received_at)}</dd>
                  </>
                )}
                {r.refund_reason && (
                  <>
                    <dt>Zdôvodnenie</dt>
                    <dd>{r.refund_reason}</dd>
                  </>
                )}
              </dl>
            </div>
          </section>
        </div>

        <aside className={css.stack}>
          {!done && (
            <section className={css.panel}>
              <div className={css.panelHead}>
                <h2 className={css.panelTitle}>Ďalší krok</h2>
              </div>
              <div className={css.panelBody}>
                <div className={css.stack}>
                  {canRefund(row.status) && (
                    <RefundForm
                      returnId={row.id}
                      status={row.status}
                      suggestedCents={suggestedCents}
                      refundableCents={refundableCents}
                      wholeOrder={row.wholeOrder}
                    />
                  )}
                  {steps.length > 0 && <ReturnSteps returnId={row.id} status={row.status} steps={steps} />}
                </div>
              </div>
            </section>
          )}
          <section className={css.panel}>
            <div className={css.panelHead}>
              <h2 className={css.panelTitle}>Interná poznámka</h2>
            </div>
            <div className={css.panelBody}>
              <ReturnNote returnId={row.id} note={r.admin_note} />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

export default function ReturnDetailPage(props: PageProps<"/admin/odstupenia/[cislo]">) {
  return (
    <Suspense fallback={<p className={css.muted}>Načítavam odstúpenie…</p>}>
      <ReturnDetail {...props} />
    </Suspense>
  );
}
