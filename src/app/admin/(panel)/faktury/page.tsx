import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { listInvoices } from "@/lib/admin/invoices-data";
import { formatEur } from "@/lib/money";
import { fmtDate } from "@/components/admin/badges";
import css from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "Faktúry" };

const METHOD: Record<string, string> = { karta: "karta", prevod: "prevod", hotovost: "hotovosť" };
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const thisMonth = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Bratislava", year: "numeric", month: "2-digit" }).format(new Date());

async function Invoices({ searchParams }: PageProps<"/admin/faktury">) {
  const sp = await searchParams;
  const raw = first(sp.mesiac);
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(raw) ? raw : thisMonth();
  const rows = await listInvoices(month);
  const live = rows.filter((r) => !r.cancelled);
  const sum = (k: "netCents" | "vatCents" | "grossCents") => live.reduce((s, r) => s + r[k], 0);

  return (
    <>
      <form className={css.filters} action="/admin/faktury">
        <label className={css.field}>
          Mesiac vystavenia
          <input className={css.input} type="month" name="mesiac" defaultValue={month} />
        </label>
        <button type="submit" className={css.btn}>
          Zobraziť
        </button>
      </form>

      {rows.length === 0 ? (
        <div className={css.panel}>
          <p className={css.empty}>V tomto mesiaci nie je vystavená žiadna faktúra ani dobropis.</p>
        </div>
      ) : (
        <div className={css.tableWrap}>
          <table className={css.table}>
            <thead>
              <tr>
                <th>Doklad</th>
                <th>Vystavený</th>
                <th>DUZP</th>
                <th>Odberateľ</th>
                <th>Objednávka</th>
                <th>Úhrada</th>
                <th className={css.num}>Základ</th>
                <th className={css.num}>DPH</th>
                <th className={css.num}>Spolu</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.hasPdf ? (
                      <a href={`/admin/doklady/${r.id}`} target="_blank" rel="noreferrer" className={css.rowLink}>
                        {r.number}
                      </a>
                    ) : (
                      r.number
                    )}
                    <div className={`${css.muted} ${css.small}`}>
                      {r.creditNote ? "Dobropis" : "Faktúra"}
                      {r.cancelled && " · stornovaná"}
                      {!r.hasPdf && " · bez PDF"}
                    </div>
                  </td>
                  <td>{fmtDate(r.issueDate)}</td>
                  <td>{fmtDate(r.taxPointDate)}</td>
                  <td className={css.wrapCell}>
                    {r.customer}
                    {r.ico && <div className={`${css.muted} ${css.small}`}>IČO {r.ico}</div>}
                  </td>
                  <td>
                    {r.orderNumber ? (
                      <Link href={`/admin/objednavky/${encodeURIComponent(r.orderNumber)}`}>{r.orderNumber}</Link>
                    ) : (
                      "–"
                    )}
                  </td>
                  <td>{METHOD[r.paymentMethod] ?? r.paymentMethod}</td>
                  <td className={css.num}>{formatEur(r.netCents)}</td>
                  <td className={css.num}>{formatEur(r.vatCents)}</td>
                  <td className={css.num}>{formatEur(r.grossCents)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={6}>Spolu za mesiac (bez stornovaných)</th>
                <th className={css.num}>{formatEur(sum("netCents"))}</th>
                <th className={css.num}>{formatEur(sum("vatCents"))}</th>
                <th className={css.num}>{formatEur(sum("grossCents"))}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}

export default function InvoicesPage(props: PageProps<"/admin/faktury">) {
  return (
    <>
      <header className={css.head}>
        <div>
          <h1 className={css.title}>Faktúry</h1>
          <p className={css.sub}>
            Faktúra vzniká pri potvrdení zaplatenej objednávky, dobropis pri vrátení peňazí. Vystavené doklady sa už nedajú
            meniť.
          </p>
        </div>
      </header>
      <Suspense fallback={<p className={css.muted}>Načítavam faktúry…</p>}>
        <Invoices {...props} />
      </Suspense>
    </>
  );
}
