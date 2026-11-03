import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopSettings } from "@/lib/catalog";
import { formatDateTime } from "@/lib/format";
import { getReturnConfirmation } from "@/lib/returns-server";
import { RETURN_STATUS_CUSTOMER } from "@/lib/returns";
import { PrintButton } from "@/components/shop/print-button";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Potvrdenie odstúpenia od zmluvy", robots: { index: false, follow: false } };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// Shown right after "Potvrdiť odstúpenie od zmluvy" (§ 20a ods. 5 ZOS: content, date and time of sending).
// The link carries the withdrawal's own secret token, not the order's.
async function Confirmation({ params, searchParams }: PageProps<"/odstupenie-od-zmluvy/potvrdenie/[cislo]">) {
  const [{ cislo }, sp] = await Promise.all([params, searchParams]);
  const r = await getReturnConfirmation(createAdminClient(), decodeURIComponent(cislo), first(sp.t));
  if (!r) notFound();
  const s = await getShopSettings();
  const returnAddress = s.pickupAddress ?? [s.street, [s.zip, s.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <>
      <header className={css.pageHead}>
        <p className={css.tape}>Odstúpenie {r.returnNumber}</p>
        <h1 className={css.pageTitle}>Odstúpenie od zmluvy sme prijali</h1>
        <p className={css.pageLede}>
          K objednávke <strong>{r.orderNumber}</strong>. Toto potvrdenie si uložte alebo vytlačte.
        </p>
      </header>

      <div className={css.legal}>
        <p className={css.okMsg} role="status">
          <Check size={18} strokeWidth={3} aria-hidden="true" />
          <span>
            Odoslané {formatDateTime(r.submittedAt)} · číslo odstúpenia {r.returnNumber} · stav: {RETURN_STATUS_CUSTOMER[r.status]}
          </span>
        </p>

        <h2 className={css.proseTitle} style={{ marginTop: 24 }}>
          Obsah odstúpenia
        </h2>
        <blockquote className={css.withdrawPreview}>{r.noticeText}</blockquote>

        <h2 className={css.proseTitle} style={{ marginTop: 24 }}>
          Čo bude ďalej
        </h2>
        <ol>
          <li>
            Ak ste stroj už prevzali, pošlite nám ho alebo ho prineste na výdajné miesto {returnAddress} najneskôr do 14
            dní od dnešného dňa. Pred odoslaním vypustite palivo z nádrže. Postup nájdete v časti{" "}
            <Link href="/odstupenie-od-zmluvy#vratenie-stroja">Ako stroj vrátiť</Link>.
          </li>
          <li>
            Ak ste stroj ešte neprevzali, nemusíte nič posielať. Objednávku zastavíme.
          </li>
          <li>
            Peniaze vrátime najneskôr do 14 dní od doručenia odstúpenia, rovnakým spôsobom, akým ste platili. S vrátením
            môžeme počkať, kým nám stroj príde alebo kým preukážete, že ste ho odoslali.
          </li>
          <li>
            Otázky? Napíšte nám na {s.email ? <a href={`mailto:${s.email}?subject=${encodeURIComponent(`Odstúpenie ${r.returnNumber}`)}`}>{s.email}</a> : "náš e-mail"}
            {s.phone ? ` alebo zavolajte na ${s.phone}` : ""} a uveďte číslo {r.returnNumber}.
          </li>
        </ol>

        <div className={css.confirmActions}>
          <PrintButton />
          <Link href="/" className={css.btnGhost}>
            Späť do obchodu
          </Link>
        </div>
      </div>
    </>
  );
}

export default function WithdrawalConfirmationPage(props: PageProps<"/odstupenie-od-zmluvy/potvrdenie/[cislo]">) {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <Suspense fallback={<p className={css.resultCount}>Načítavam potvrdenie…</p>}>
        <Confirmation {...props} />
      </Suspense>
    </div>
  );
}
