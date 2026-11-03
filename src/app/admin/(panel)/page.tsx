import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { dashboardStats, type OrderRow } from "@/lib/admin/orders-data";
import { returnsDashboard } from "@/lib/admin/returns-data";
import { formatEur } from "@/lib/money";
import { LiveOrders } from "@/components/admin/live-orders";
import { fmtDate, fmtDateTime, StatusBadge, WindowBadge } from "@/components/admin/badges";
import css from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "Prehľad" };

function OrderList({ rows, empty, extra }: { rows: OrderRow[]; empty: string; extra: (r: OrderRow) => ReactNode }) {
  if (rows.length === 0) return <p className={css.empty}>{empty}</p>;
  return (
    <table className={css.table}>
      <tbody>
        {rows.slice(0, 8).map((r) => (
          <tr key={r.id}>
            <td>
              <Link href={`/admin/objednavky/${encodeURIComponent(r.number)}`} className={css.rowLink}>
                {r.number}
              </Link>
              <div className={`${css.muted} ${css.small}`}>{r.customer}</div>
            </td>
            <td className={css.num}>{formatEur(r.totalGrossCents)}</td>
            <td>{extra(r)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

async function Dashboard() {
  const [s, ret] = await Promise.all([dashboardStats(), returnsDashboard()]);
  return (
    <>
      <div className={css.kpis}>
        <Link href="/admin/objednavky?stav=reserved" className={css.kpi} data-tone={s.reservationsOverdue ? "red" : s.reservations.length ? "amber" : undefined}>
          <div className={css.kpiLabel}>Rezervácie na zavolanie</div>
          <div className={css.kpiValue}>{s.reservations.length}</div>
          <div className={css.kpiNote}>
            {s.reservationsOverdue ? `${s.reservationsOverdue} čaká dlhšie ako 1 pracovný deň` : "zavolať pred objednaním u dodávateľa"}
          </div>
        </Link>
        <Link href="/admin/objednavky?stav=paid" className={css.kpi} data-tone={s.unconfirmedOverdue ? "red" : s.unconfirmed.length ? "amber" : undefined}>
          <div className={css.kpiLabel}>Na potvrdenie</div>
          <div className={css.kpiValue}>{s.unconfirmed.length}</div>
          <div className={css.kpiNote}>
            {s.unconfirmedOverdue ? `${s.unconfirmedOverdue} čaká dlhšie ako 1 pracovný deň` : "zaplatené, čakajú na overenie dostupnosti"}
          </div>
        </Link>
        <Link href="/admin/odstupenia" className={css.kpi} data-tone={ret.refundDue.length ? "red" : ret.open.length ? "amber" : undefined}>
          <div className={css.kpiLabel}>Odstúpenia na vybavenie</div>
          <div className={css.kpiValue}>{ret.open.length}</div>
          <div className={css.kpiNote}>
            {ret.refundDue.length ? `${ret.refundDue.length} treba vrátiť do 3 dní alebo po lehote` : "peniaze vrátiť do 14 dní od oznámenia"}
          </div>
        </Link>
        <Link href="/admin/objednavky?lehota=open" className={css.kpi} data-tone={s.withdrawalOpen.length ? "red" : undefined}>
          <div className={css.kpiLabel}>Plynie lehota na odstúpenie</div>
          <div className={css.kpiValue}>{s.withdrawalOpen.length}</div>
          <div className={css.kpiNote}>
            {formatEur(s.withdrawalOpen.reduce((sum, r) => sum + r.totalGrossCents, 0))} v riziku
          </div>
        </Link>
        <Link href="/admin/objednavky?lehota=before_delivery" className={css.kpi} data-tone={s.beforeDelivery ? "amber" : undefined}>
          <div className={css.kpiLabel}>Spotrebitelia pred doručením</div>
          <div className={css.kpiValue}>{s.beforeDelivery}</div>
          <div className={css.kpiNote}>lehota sa začne doručením</div>
        </Link>
        <div className={css.kpi}>
          <div className={css.kpiLabel}>Tržby tento mesiac</div>
          <div className={css.kpiValue}>{formatEur(s.monthRevenueCents)}</div>
          <div className={css.kpiNote}>
            {s.monthOrders} obj. · marža bez DPH {formatEur(s.monthMarginCents)}
          </div>
        </div>
      </div>

      <div className={css.grid2}>
        <section className={css.panel}>
          <div className={css.panelHead}>
            <h2 className={css.panelTitle}>Čakajú na potvrdenie</h2>
            <span className={`${css.muted} ${css.small}`}>cieľ: do 1 pracovného dňa</span>
          </div>
          <OrderList rows={s.unconfirmed} empty="Žiadna zaplatená objednávka nečaká." extra={(r) => <span className={css.small}>zaplatené {fmtDateTime(r.paidAt)}</span>} />
        </section>

        <section className={css.panel}>
          <div className={css.panelHead}>
            <h2 className={css.panelTitle}>Lehota na odstúpenie</h2>
            <Link href="/admin/objednavky?lehota=open" className={css.small}>
              Všetky
            </Link>
          </div>
          <OrderList
            rows={[...s.withdrawalOpen, ...s.withdrawalGrace]}
            empty="Žiadnemu spotrebiteľovi teraz neplynie lehota."
            extra={(r) => <WindowBadge info={r.withdrawal} />}
          />
        </section>

        <section className={css.panel}>
          <div className={css.panelHead}>
            <h2 className={css.panelTitle}>Záväzná dodacia lehota</h2>
            <span className={`${css.muted} ${css.small}`}>uplynie do 2 prac. dní alebo už uplynula</span>
          </div>
          <OrderList
            rows={s.deliveryAtRisk}
            empty="Všetky objednávky sú v termíne."
            extra={(r) => (
              <>
                <StatusBadge status={r.status} />
                <div className={css.small}>doručiť do {fmtDate(r.deliveryLimit)}</div>
              </>
            )}
          />
        </section>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <>
      <header className={css.head}>
        <div>
          <h1 className={css.title}>Prehľad</h1>
          <p className={css.sub}>Čo treba dnes vybaviť a kde je riziko.</p>
        </div>
        <LiveOrders />
      </header>
      <Suspense fallback={<p className={css.muted}>Načítavam…</p>}>
        <Dashboard />
      </Suspense>
    </>
  );
}
