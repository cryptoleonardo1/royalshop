import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { listReturns } from "@/lib/admin/returns-data";
import { formatEur } from "@/lib/money";
import { RETURN_CHANNEL_LABELS, RETURN_DONE } from "@/lib/returns";
import { fmtDateTime, RefundDeadline, ReturnBadge } from "@/components/admin/badges";
import css from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "Odstúpenia" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const FILTERS = [
  { key: "open", param: "", label: "Na vybavenie" },
  { key: "done", param: "done", label: "Vybavené" },
  { key: "", param: "vsetky", label: "Všetky" },
] as const;

async function Returns({ searchParams }: PageProps<"/admin/odstupenia">) {
  const raw = first((await searchParams).stav);
  const filter = raw === "done" ? "done" : raw === "vsetky" ? "" : "open";
  const rows = await listReturns(filter);

  return (
    <>
      <div className={css.chips} role="group" aria-label="Stav odstúpenia">
        {FILTERS.map((f) => (
          <Link
            key={f.param}
            href={f.param ? `/admin/odstupenia?stav=${f.param}` : "/admin/odstupenia"}
            className={css.chip}
            aria-current={filter === f.key}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className={css.panel}>
          <p className={css.empty}>{filter === "open" ? "Žiadne odstúpenie nečaká na vybavenie." : "Žiadne odstúpenia."}</p>
        </div>
      ) : (
        <div className={css.tableWrap}>
          <table className={css.table}>
            <thead>
              <tr>
                <th>Odstúpenie</th>
                <th>Objednávka</th>
                <th>Zákazník</th>
                <th>Rozsah</th>
                <th>Stav</th>
                <th>Vrátiť peniaze</th>
                <th className={css.num}>Vrátené</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/odstupenia/${encodeURIComponent(r.number)}`} className={css.rowLink}>
                      {r.number}
                    </Link>
                    <div className={`${css.muted} ${css.small}`}>
                      {fmtDateTime(r.submittedAt)} · {RETURN_CHANNEL_LABELS[r.channel]}
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/objednavky/${encodeURIComponent(r.orderNumber)}`}>{r.orderNumber}</Link>
                  </td>
                  <td className={css.wrapCell}>
                    {r.name}
                    <div className={`${css.muted} ${css.small}`}>{r.email}</div>
                  </td>
                  <td className={css.small}>{r.wholeOrder ? "celá objednávka" : "časť objednávky"}</td>
                  <td>
                    <ReturnBadge status={r.status} />
                  </td>
                  <td>
                    <RefundDeadline deadline={r.refundDeadline} days={r.refundDaysLeft} done={RETURN_DONE.includes(r.status)} />
                  </td>
                  <td className={css.num}>{r.refundCents == null ? <span className={css.muted}>–</span> : formatEur(r.refundCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function ReturnsPage(props: PageProps<"/admin/odstupenia">) {
  return (
    <>
      <header className={css.head}>
        <div>
          <h1 className={css.title}>Odstúpenia</h1>
          <p className={css.sub}>
            Peniaze treba vrátiť do 14 dní od doručenia odstúpenia. Počkať smiete len dovtedy, kým stroj nepríde alebo kým
            zákazník nepreukáže, že ho odoslal.
          </p>
        </div>
      </header>
      <Suspense fallback={<p className={css.muted}>Načítavam odstúpenia…</p>}>
        <Returns {...props} />
      </Suspense>
    </>
  );
}
