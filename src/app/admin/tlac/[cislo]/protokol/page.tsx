import { Suspense } from "react";
import type { Metadata } from "next";
import { fmtDate } from "@/components/admin/badges";
import { PrintToolbar } from "@/components/admin/print-toolbar";
import { formatEur } from "@/lib/money";
import { loadPrintData, PROVIDER_PRINT } from "@/lib/admin/print-data";
import css from "@/components/admin/print.module.css";

export const metadata: Metadata = { title: "Preberací protokol" };

// Handover protocol and training record. Our evidence in a claim (docs/08 R3): the machine was complete and
// working, the customer got the Slovak manual and was trained. Serial number and hour meter are written by
// hand when the system does not have them.

async function Protocol({ params }: PageProps<"/admin/tlac/[cislo]/protokol">) {
  const { cislo } = await params;
  const { order: o, settings: s } = await loadPrintData(cislo);
  const customer = o.company ? `${o.company.name}, IČO ${o.company.ico}` : o.billing.name;
  const payment = o.paidCents >= o.totalGrossCents ? o.payments.at(-1) : undefined;

  return (
    <div className={css.page}>
      <PrintToolbar orderNumber={o.number} />
      <article className={css.sheet}>
        <h1 className={css.title}>Preberací protokol a záznam o zaškolení</h1>
        <p className={css.subtitle}>
          k objednávke / kúpnej zmluve č. {o.number}
        </p>

        <div className={css.parties}>
          <div>
            <p>
              <strong>Odovzdávajúci:</strong> {s.companyName}
            </p>
            <p>{s.pickupAddress}</p>
          </div>
          <div>
            <p>
              <strong>Preberajúci:</strong> {customer}
            </p>
            <p>
              {o.billing.street}, {o.billing.zip} {o.billing.city}
            </p>
            <p>
              {o.email}
              {o.phone && `, ${o.phone}`}
            </p>
          </div>
        </div>

        <h2 className={css.h2}>1. Odovzdaný tovar</h2>
        <table className={css.table}>
          <thead>
            <tr>
              <th>Tovar</th>
              <th className={css.num}>Ks</th>
              <th>Výrobné číslo</th>
              <th>Motohodiny</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((i, idx) => (
              <tr key={idx}>
                <td>
                  {i.name}
                  {i.sku && <div className={css.small}>{i.sku}</div>}
                </td>
                <td className={css.num}>{i.quantity}</td>
                <td style={{ minWidth: "38mm" }}>{i.serialNumber ?? ""}</td>
                <td style={{ minWidth: "22mm" }} />
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className={css.h2}>2. Stav pri odovzdaní</h2>
        <ul className={css.checks}>
          <li>Stroj je nový, kompletný a bez viditeľného poškodenia, vrátane príslušenstva podľa návodu.</li>
          <li>Stroj bol v prítomnosti preberajúceho spustený a funguje.</li>
          <li>Odovzdaný návod na používanie a bezpečnostné pokyny v slovenskom jazyku.</li>
          <li>Výrobok má označenie CE, k dispozícii je EÚ vyhlásenie o zhode.</li>
          <li>Vyhotovená fotodokumentácia stroja a výrobného štítku.</li>
        </ul>

        <h2 className={css.h2}>3. Zaškolenie</h2>
        <p>Preberajúci bol oboznámený s:</p>
        <ul className={css.checks}>
          <li>obsluhou stroja, spúšťaním a vypínaním,</li>
          <li>bezpečnosťou práce a ochrannými pomôckami,</li>
          <li>údržbou, mazaním, čistením a výmenou pracovných nástrojov (kotúča),</li>
          <li>prepravou a skladovaním stroja,</li>
          <li>postupom pri reklamácii a kontaktom na servis.</li>
        </ul>
        <p>
          Zaškolil: <span className={css.blank} /> &nbsp; Trvanie: <span className={css.blank} />
        </p>

        <h2 className={css.h2}>4. Platba</h2>
        {payment ? (
          <p>
            Kúpna cena {formatEur(o.totalGrossCents)} je zaplatená ({fmtDate(payment.capturedAt)} {PROVIDER_PRINT[payment.provider] ?? ""}).
          </p>
        ) : (
          <p>
            Zaplatené: <span className={css.blank} /> €
          </p>
        )}

        <h2 className={css.h2}>5. Poznámky</h2>
        <span className={css.blankWide} />
        <span className={css.blankWide} />

        <p className={css.small} style={{ marginTop: 12 }}>
          Preberajúci potvrdzuje, že tovar prevzal v uvedenom stave a bol zaškolený. Dňom prevzatia začína plynúť
          lehota na uplatnenie práv z vád ({o.customerType === "company" ? "12 mesiacov podľa reklamačného poriadku pre firmy" : "24 mesiacov"}).
        </p>
        <p style={{ marginTop: 14 }}>
          Miesto: <span className={css.blank} /> &nbsp; Dátum a čas prevzatia: <span className={css.blank} />
        </p>
        <div className={`${css.signatures} ${css.keep}`}>
          <div>Odovzdal (meno, podpis)</div>
          <div>Prevzal (meno, podpis)</div>
        </div>
      </article>
    </div>
  );
}

export default function ProtocolPage(props: PageProps<"/admin/tlac/[cislo]/protokol">) {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Načítavam protokol…</p>}>
      <Protocol {...props} />
    </Suspense>
  );
}
