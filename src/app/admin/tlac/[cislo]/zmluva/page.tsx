import { Suspense } from "react";
import type { Metadata } from "next";
import { fmtDate } from "@/components/admin/badges";
import { PrintToolbar } from "@/components/admin/print-toolbar";
import { formatEur } from "@/lib/money";
import { LEGAL_VERSION, SOI } from "@/lib/legal";
import { loadPrintData, PROVIDER_PRINT } from "@/lib/admin/print-data";
import css from "@/components/admin/print.module.css";

export const metadata: Metadata = { title: "Kúpna zmluva" };

// Purchase contract for a sale signed in our shop (docs/09). Signed on paper in two copies; the signature in
// the shop is what makes it an on-premises contract without the statutory 14-day withdrawal (docs/08 R1).
// The whole price is paid at signing (no deposits); before the payment is recorded it prints as blanks.
// Not reviewed by a lawyer yet.

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.royalstroje.sk").replace(/\/$/, "");

async function Contract({ params }: PageProps<"/admin/tlac/[cislo]/zmluva">) {
  const { cislo } = await params;
  const { order: o, settings: s } = await loadPrintData(cislo);
  // only a reservation about to be signed in the shop, or a sale already recorded as signed there
  if (o.customerType !== "person" || (o.status !== "reserved" && o.contractPlace !== "on_premises")) {
    return (
      <div className={css.page}>
        <PrintToolbar orderNumber={o.number} />
        <article className={css.sheet}>
          <p>
            Kúpnu zmluvu na predaj v predajni tlačíme len k rezervácii spotrebiteľa alebo k predaju zaevidovanému ako
            uzavretý v predajni. Táto objednávka je {o.customerType === "company" ? "firemná" : "zmluva na diaľku"}.
          </p>
        </article>
      </div>
    );
  }
  const seller = [s.street, [s.zip, s.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const premises = s.pickupAddress ?? seller;
  const payment = o.paymentStatus === "paid" ? o.payments.at(-1) : undefined;
  const delivery = o.method === "pickup_senec" ? `osobne v prevádzke predávajúceho (${premises})` : `doručením na adresu ${[o.shipping?.street, o.shipping?.zip, o.shipping?.city].filter(Boolean).join(", ") || "uvedenú kupujúcim"}`;

  return (
    <div className={css.page}>
      <PrintToolbar orderNumber={o.number} />
      <article className={css.sheet}>
        <h1 className={css.title}>Kúpna zmluva č. {o.number}</h1>
        <p className={css.subtitle}>uzavretá podľa § 588 a nasl. Občianskeho zákonníka</p>

        <h2 className={css.h2}>1. Zmluvné strany</h2>
        <div className={css.parties}>
          <div>
            <p>
              <strong>Predávajúci:</strong> {s.companyName}
            </p>
            <p>sídlo: {seller}</p>
            <p>
              IČO: {s.ico ?? "–"}, DIČ: {s.dic ?? "–"}
              {s.icDph && `, IČ DPH: ${s.icDph}`}
            </p>
            {s.registerInfo && <p className={css.small}>{s.registerInfo}</p>}
            <p>
              {s.email}
              {s.phone && `, ${s.phone}`}
            </p>
          </div>
          <div>
            <p>
              <strong>Kupujúci (spotrebiteľ):</strong> {o.billing.name}
            </p>
            <p>
              adresa: {o.billing.street}, {o.billing.zip} {o.billing.city}
            </p>
            <p>e-mail: {o.email}</p>
            <p>telefón: {o.phone ?? <span className={css.blank} />}</p>
          </div>
        </div>

        <h2 className={css.h2}>2. Predmet zmluvy</h2>
        <p>Predávajúci predáva kupujúcemu tento nový tovar a kupujúci ho kupuje:</p>
        <table className={css.table}>
          <thead>
            <tr>
              <th>Tovar</th>
              <th>Kód</th>
              <th className={css.num}>Ks</th>
              <th className={css.num}>Cena/ks s DPH</th>
              <th className={css.num}>Spolu s DPH</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((i, idx) => (
              <tr key={idx}>
                <td>{i.name}</td>
                <td>{i.sku ?? "–"}</td>
                <td className={css.num}>{i.quantity}</td>
                <td className={css.num}>{formatEur(i.unitGrossCents)}</td>
                <td className={css.num}>{formatEur(i.lineGrossCents)}</td>
              </tr>
            ))}
            {o.shippingPriceCents > 0 && (
              <tr>
                <td colSpan={4}>Doprava</td>
                <td className={css.num}>{formatEur(o.shippingPriceCents)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={4}>
                <strong>Kúpna cena celkom</strong> (z toho DPH {formatEur(o.totalVatCents)})
              </td>
              <td className={css.num}>
                <strong>{formatEur(o.totalGrossCents)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <p className={css.small}>Výrobné číslo stroja sa uvedie v preberacom protokole pri odovzdaní.</p>

        <h2 className={css.h2}>3. Kúpna cena a platba</h2>
        <p>
          Kupujúci zaplatil pri podpise zmluvy celú kúpnu cenu {formatEur(o.totalGrossCents)}
          {payment ? (
            <>
              {" "}
              dňa {fmtDate(payment.capturedAt)} {PROVIDER_PRINT[payment.provider] ?? ""}.
            </>
          ) : (
            <> (hotovosť / karta v predajni / prevod, zakrúžkujte).</>
          )}
        </p>

        <h2 className={css.h2}>4. Odovzdanie tovaru</h2>
        <p>
          Predávajúci odovzdá tovar {delivery}
          {o.status === "reserved" || o.estimatedDeliveryDate ? (
            <>
              {" "}
              najneskôr dňa{" "}
              {o.estimatedDeliveryDate ? <strong>{fmtDate(`${o.estimatedDeliveryDate}T12:00:00Z`)}</strong> : <span className={css.blank} />}
            </>
          ) : (
            " pri podpise zmluvy"
          )}
          . Ak tovar
          v tomto termíne neodovzdá, kupujúci mu môže určiť primeranú dodatočnú lehotu. Ak predávajúci tovar
          neodovzdá ani v nej, kupujúci môže od zmluvy odstúpiť a predávajúci mu bez zbytočného odkladu vráti všetko,
          čo od neho prijal.
        </p>
        <p>
          Pri odovzdaní predávajúci stroj predvedie a kupujúceho zaškolí v obsluhe, údržbe a bezpečnosti práce.
          Odovzdanie sa potvrdí preberacím protokolom. Nebezpečenstvo škody na tovare prechádza na kupujúceho jeho
          prevzatím.
        </p>

        <h2 className={css.h2}>5. Miesto uzavretia zmluvy</h2>
        <p>
          Zmluva je uzavretá pri súčasnej fyzickej prítomnosti zmluvných strán v prevádzkových priestoroch
          predávajúceho ({premises}). Nejde o zmluvu uzavretú na diaľku ani mimo prevádzkových priestorov predávajúceho
          podľa zákona č. 108/2024 Z. z., preto sa na ňu nevzťahuje právo spotrebiteľa odstúpiť od zmluvy bez udania
          dôvodu do 14 dní. Predchádzajúca nezáväzná rezervácia č. {o.number} cez internetový obchod kupujúceho
          k ničomu nezaväzovala.
        </p>

        <h2 className={css.h2}>6. Zodpovednosť za vady</h2>
        <p>
          Predávajúci zodpovedá za vady, ktoré má tovar pri prevzatí alebo ktoré sa prejavia do 24 mesiacov od
          prevzatia. Práva z vád (reklamáciu) môže kupujúci uplatniť v prevádzke predávajúceho alebo e-mailom
          {s.email ? ` na ${s.email}` : ""}, postup upravuje reklamačný poriadok ({site}/reklamacny-poriadok).
        </p>

        <h2 className={css.h2}>7. Záverečné ustanovenia</h2>
        <ul className={css.list}>
          <li>
            Ostatné práva a povinnosti sa riadia Občianskym zákonníkom a obchodnými podmienkami predávajúceho vo
            verzii {LEGAL_VERSION} ({site}/obchodne-podmienky), s ktorými sa kupujúci oboznámil.
          </li>
          <li>
            Osobné údaje kupujúceho spracúva predávajúci na plnenie tejto zmluvy podľa zásad ochrany osobných
            údajov ({site}/ochrana-osobnych-udajov).
          </li>
          <li>
            Spotrebiteľ sa môže obrátiť na {SOI.name}, {SOI.address} ({SOI.web}), ktorá je aj subjektom
            alternatívneho riešenia sporov.
          </li>
          <li>Zmluva je vyhotovená v dvoch rovnopisoch, každá strana dostane jeden. Účinnosť nadobúda podpisom.</li>
        </ul>

        <p style={{ marginTop: 18 }}>
          V Boldogu dňa <span className={css.blank} />
        </p>
        <div className={`${css.signatures} ${css.keep}`}>
          <div>
            Predávajúci (meno, podpis)
            <br />
            <span className={css.small}>{s.companyName}</span>
          </div>
          <div>
            Kupujúci (podpis)
            <br />
            <span className={css.small}>{o.billing.name}</span>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function ContractPage(props: PageProps<"/admin/tlac/[cislo]/zmluva">) {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Načítavam zmluvu…</p>}>
      <Contract {...props} />
    </Suspense>
  );
}
