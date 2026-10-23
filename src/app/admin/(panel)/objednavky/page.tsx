import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { listOrders } from "@/lib/admin/orders-data";
import { formatEur } from "@/lib/money";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/order-state";
import { WITHDRAWAL_WINDOW_LABELS, WITHDRAWAL_WINDOWS, type WithdrawalWindow } from "@/lib/withdrawal";
import { LiveOrders } from "@/components/admin/live-orders";
import { fmtDate, fmtDateTime, PaymentBadge, StatusBadge, WindowBadge } from "@/components/admin/badges";
import css from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "Objednávky" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function Orders({ searchParams }: PageProps<"/admin/objednavky">) {
  const sp = await searchParams;
  const q = first(sp.q);
  const status = first(sp.stav);
  const windowParam = first(sp.lehota);
  const win = (WITHDRAWAL_WINDOWS as string[]).includes(windowParam) ? (windowParam as WithdrawalWindow) : "";

  // counts per window come from the same status/search filter, so the chips always add up
  const { rows: all, truncated } = await listOrders({ q, status });
  const rows = win ? all.filter((r) => r.withdrawal.window === win) : all;
  const counts = new Map<WithdrawalWindow, number>();
  all.forEach((r) => counts.set(r.withdrawal.window, (counts.get(r.withdrawal.window) ?? 0) + 1));

  const href = (next: Partial<Record<"q" | "stav" | "lehota", string>>) => {
    const params = new URLSearchParams();
    const merged = { q, stav: status, lehota: win, ...next };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    const s = params.toString();
    return s ? `/admin/objednavky?${s}` : "/admin/objednavky";
  };

  return (
    <>
      <form className={css.filters} action="/admin/objednavky">
        <label className={css.field}>
          Hľadať
          <input className={css.input} name="q" defaultValue={q} placeholder="číslo, meno, e-mail, IČO" size={28} />
        </label>
        <label className={css.field}>
          Stav
          <select className={css.select} name="stav" defaultValue={status}>
            <option value="">Všetky</option>
            <option value="active">Rozpracované (zaplatené, nedoručené)</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        {win && <input type="hidden" name="lehota" value={win} />}
        <button type="submit" className={css.btn}>
          Filtrovať
        </button>
        {(q || status || win) && (
          <Link href="/admin/objednavky" className={`${css.btn} ${css.btnGhost}`}>
            Zrušiť filtre
          </Link>
        )}
      </form>

      <div className={css.chips} role="group" aria-label="Lehota na odstúpenie">
        <Link href={href({ lehota: "" })} className={css.chip} aria-current={!win}>
          Všetky lehoty <b>{all.length}</b>
        </Link>
        {WITHDRAWAL_WINDOWS.map((w) => (
          <Link key={w} href={href({ lehota: w })} className={css.chip} aria-current={win === w}>
            {WITHDRAWAL_WINDOW_LABELS[w]} <b>{counts.get(w) ?? 0}</b>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className={css.panel}>
          <p className={css.empty}>Žiadne objednávky pre tento filter.</p>
        </div>
      ) : (
        <div className={css.tableWrap}>
          <table className={css.table}>
            <thead>
              <tr>
                <th>Objednávka</th>
                <th>Zákazník</th>
                <th className={css.num}>Suma</th>
                <th className={css.num}>Marža</th>
                <th>Stav</th>
                <th>Platba</th>
                <th>Odstúpenie</th>
                <th>Doručenie</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/objednavky/${encodeURIComponent(r.number)}`} className={css.rowLink}>
                      {r.number}
                    </Link>
                    <div className={`${css.muted} ${css.small}`}>{fmtDateTime(r.createdAt)}</div>
                  </td>
                  <td className={css.wrapCell}>
                    {r.customer}
                    <div className={`${css.muted} ${css.small}`}>
                      {r.customerType === "company" ? "Firma" : "Spotrebiteľ"} · {r.email}
                    </div>
                  </td>
                  <td className={css.num}>{formatEur(r.totalGrossCents)}</td>
                  <td className={css.num}>{r.marginNetCents == null ? <span className={css.muted}>–</span> : formatEur(r.marginNetCents)}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    <PaymentBadge status={r.paymentStatus} />
                  </td>
                  <td>
                    <WindowBadge info={r.withdrawal} />
                    {r.withdrawal.deadline && <div className={`${css.muted} ${css.small}`}>do {fmtDate(r.withdrawal.deadline)}</div>}
                  </td>
                  <td className={css.small}>
                    {r.deliveredAt ? (
                      <>doručené {fmtDate(r.deliveredAt)}</>
                    ) : r.deliveryLimit ? (
                      <>najneskôr {fmtDate(r.deliveryLimit)}</>
                    ) : (
                      <span className={css.muted}>–</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {truncated && <p className={`${css.muted} ${css.small}`}>Zobrazených je posledných 500 objednávok. Zúžte filter.</p>}
    </>
  );
}

export default function OrdersPage(props: PageProps<"/admin/objednavky">) {
  return (
    <>
      <header className={css.head}>
        <div>
          <h1 className={css.title}>Objednávky</h1>
          <p className={css.sub}>
            Filter „Odstúpenie“ ukazuje, ktorým spotrebiteľom ešte plynie 14-dňová lehota a pri ktorých je už bezpečne po
            nej.
          </p>
        </div>
        <LiveOrders />
      </header>
      <Suspense fallback={<p className={css.muted}>Načítavam objednávky…</p>}>
        <Orders {...props} />
      </Suspense>
    </>
  );
}
