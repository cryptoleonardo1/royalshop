"use client";

import { useActionState, useState, useTransition, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Building2, CreditCard, Lock, Store, Truck, User } from "lucide-react";
import { placeOrder, type PlaceOrderState } from "@/lib/checkout-actions";
import type { ShippingMethod } from "@/lib/order-state";
import { formatEur } from "@/lib/money";
import { formatDeliveryDate } from "@/lib/format";
import { useHydrated, useQuote } from "./use-quote";
import css from "./shop.module.css";

const METHOD_LABEL: Record<ShippingMethod, string> = {
  courier: "Doručenie na adresu",
  own_transport: "Doručenie na adresu",
  pickup_senec: "Osobný odber v predajni",
};

const dateLabel = (iso: string) => formatDeliveryDate(new Date(`${iso}T12:00:00Z`));

function Field({
  name,
  label,
  error,
  hint,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; name: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = `co-${name}`;
  const describedBy = [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={css.field} data-invalid={error ? true : undefined}>
      <label htmlFor={id}>{label}</label>
      {children({ id, name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && (
        <span id={`${id}-hint`} className={css.fieldHint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-err`} className={css.fieldError}>
          {error}
        </span>
      )}
    </div>
  );
}

export function CheckoutForm({
  pickupAddress,
  pickupHours,
  demoPayments,
}: {
  pickupAddress: string | null;
  pickupHours: string | null;
  demoPayments: boolean;
}) {
  const hydrated = useHydrated();
  const [customerType, setCustomerType] = useState<"person" | "company">("person");
  const [method, setMethod] = useState<ShippingMethod | null>(null);
  const [shipDifferent, setShipDifferent] = useState(false);
  const { lines, quote, loading } = useQuote(method);
  const [state, dispatch] = useActionState<PlaceOrderState, FormData>(placeOrder, undefined);
  const [submitting, startSubmit] = useTransition();
  const errors = state?.errors ?? {};

  if (!hydrated) return <p className={css.resultCount}>Načítavam pokladňu…</p>;
  if (lines.length === 0) {
    return (
      <div className={css.empty}>
        <p className={css.emptyTitle}>Košík je prázdny</p>
        <Link href="/produkty" className={css.btnPrimary}>
          Prezrieť sortiment <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const chosen = quote?.method ?? method ?? "courier";
  const pickupOnly = quote && !quote.options.some((o) => o.method === "courier");

  // Submitted via the action dispatcher (not <form action>) so React keeps the typed values on errors.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("lines", JSON.stringify(lines.map((l) => ({ slug: l.slug, quantity: l.quantity }))));
    startSubmit(() => dispatch(data));
  };

  return (
    <form className={css.checkout} onSubmit={onSubmit} noValidate>
      <div className={css.checkoutMain}>
        {state?.message && (
          <p className={css.notice} role="alert">
            <AlertTriangle size={18} aria-hidden="true" /> {state.message}
          </p>
        )}

        <fieldset className={css.coStep}>
          <legend className={css.coLegend}>
            <span>01</span> Nakupujete ako
          </legend>
          <div className={css.choiceRow}>
            {(
              [
                ["person", "Súkromná osoba", User],
                ["company", "Firma / živnostník", Building2],
              ] as const
            ).map(([value, label, Icon]) => (
              <label key={value} className={css.choice}>
                <input
                  type="radio"
                  name="customerType"
                  value={value}
                  checked={customerType === value}
                  onChange={() => setCustomerType(value)}
                />
                <span className={css.choiceBody}>
                  <Icon size={22} aria-hidden="true" />
                  <strong>{label}</strong>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={css.coStep}>
          <legend className={css.coLegend}>
            <span>02</span> Kontakt
          </legend>
          <div className={css.fieldGrid}>
            <Field name="firstName" label="Meno" error={errors.firstName}>
              {(p) => <input {...p} autoComplete="given-name" required />}
            </Field>
            <Field name="lastName" label="Priezvisko" error={errors.lastName}>
              {(p) => <input {...p} autoComplete="family-name" required />}
            </Field>
            <Field name="email" label="E-mail" error={errors.email} hint="Pošleme naň potvrdenie a stav objednávky.">
              {(p) => <input {...p} type="email" autoComplete="email" inputMode="email" required />}
            </Field>
            <Field name="phone" label="Telefón" error={errors.phone} hint="Pre kuriéra alebo pri doručení stroja.">
              {(p) => <input {...p} type="tel" autoComplete="tel" inputMode="tel" placeholder="+421" required />}
            </Field>
          </div>
        </fieldset>

        <fieldset className={css.coStep}>
          <legend className={css.coLegend}>
            <span>03</span> Fakturačné údaje
          </legend>
          {customerType === "company" && (
            <div className={css.fieldGrid}>
              <Field name="companyName" label="Obchodné meno" error={errors.companyName}>
                {(p) => <input {...p} autoComplete="organization" required />}
              </Field>
              <Field name="ico" label="IČO" error={errors.ico}>
                {(p) => <input {...p} inputMode="numeric" required />}
              </Field>
              <Field name="dic" label="DIČ" error={errors.dic}>
                {(p) => <input {...p} inputMode="numeric" required />}
              </Field>
              <Field name="icDph" label="IČ DPH (ak ste platiteľ)" error={errors.icDph}>
                {(p) => <input {...p} placeholder="SK" />}
              </Field>
            </div>
          )}
          <div className={css.fieldGrid}>
            <Field name="street" label="Ulica a číslo" error={errors.street}>
              {(p) => <input {...p} autoComplete="address-line1" required />}
            </Field>
            <Field name="city" label="Mesto" error={errors.city}>
              {(p) => <input {...p} autoComplete="address-level2" required />}
            </Field>
            <Field name="zip" label="PSČ" error={errors.zip}>
              {(p) => <input {...p} autoComplete="postal-code" inputMode="numeric" required />}
            </Field>
            <div className={css.field}>
              <span className={css.fieldStatic}>Krajina</span>
              <span className={css.fieldValue}>Slovensko</span>
            </div>
          </div>
        </fieldset>

        <fieldset className={css.coStep}>
          <legend className={css.coLegend}>
            <span>04</span> Doprava
          </legend>
          {pickupOnly && (
            <p className={css.notice}>
              <Store size={18} aria-hidden="true" /> Niektorý stroj v košíku si treba vyzdvihnúť osobne v našej predajni
              v Boldogu pri Senci.
            </p>
          )}
          <div className={css.choiceStack}>
            {(quote?.options ?? []).map((o) => (
              <label key={o.method} className={css.choice}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value={o.method}
                  checked={chosen === o.method}
                  onChange={() => setMethod(o.method)}
                />
                <span className={css.choiceBody}>
                  {o.method === "pickup_senec" ? (
                    <Store size={22} aria-hidden="true" />
                  ) : (
                    <Truck size={22} aria-hidden="true" />
                  )}
                  <span className={css.choiceText}>
                    <strong>{METHOD_LABEL[o.method]}</strong>
                    <span>
                      {o.method === "pickup_senec"
                        ? `Pripravené ${dateLabel(o.estimatedDelivery)} · ${pickupAddress ?? "predajňa Royal Stroje"}${pickupHours ? ` · ${pickupHours}` : ""}`
                        : `${quote ? `${quote.deliveryRate.name} · ` : ""}doručenie predpokladane ${dateLabel(o.estimatedDelivery)}`}
                    </span>
                  </span>
                  <span className={css.choicePrice}>
                    {o.priceCents === 0 ? "zdarma" : formatEur(o.priceCents)}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errors.shippingMethod && <p className={css.fieldError}>{errors.shippingMethod}</p>}

          {chosen !== "pickup_senec" && (
            <>
              <label className={css.checkRow}>
                <input
                  type="checkbox"
                  name="shipDifferent"
                  checked={shipDifferent}
                  onChange={(e) => setShipDifferent(e.target.checked)}
                />
                <span className={css.facetBox} aria-hidden="true" />
                Doručiť na inú adresu (napr. na stavbu)
              </label>
              {shipDifferent && (
                <div className={css.fieldGrid}>
                  <Field name="shipName" label="Meno príjemcu / firma" error={errors.shipName}>
                    {(p) => <input {...p} autoComplete="shipping name" />}
                  </Field>
                  <Field name="shipStreet" label="Ulica a číslo" error={errors.shipStreet}>
                    {(p) => <input {...p} autoComplete="shipping address-line1" />}
                  </Field>
                  <Field name="shipCity" label="Mesto" error={errors.shipCity}>
                    {(p) => <input {...p} autoComplete="shipping address-level2" />}
                  </Field>
                  <Field name="shipZip" label="PSČ" error={errors.shipZip}>
                    {(p) => <input {...p} autoComplete="shipping postal-code" inputMode="numeric" />}
                  </Field>
                </div>
              )}
            </>
          )}

          <Field name="note" label="Poznámka k objednávke (nepovinné)" error={errors.note}>
            {(p) => <textarea {...p} rows={3} maxLength={1000} />}
          </Field>
        </fieldset>
      </div>

      <aside className={css.summary} aria-labelledby="co-summary-title" data-loading={loading || undefined}>
        <h2 id="co-summary-title" className={css.summaryTitle}>
          <span>05</span> Súhrn objednávky
        </h2>
        <ul className={css.summaryLines}>
          {(quote?.lines ?? []).map((l) => (
            <li key={l.product.slug}>
              <span>
                {l.quantity}× {l.product.name}
              </span>
              <strong>{formatEur(l.lineGrossCents)}</strong>
            </li>
          ))}
        </ul>
        <dl className={css.summaryRows}>
          <div>
            <dt>Tovar</dt>
            <dd>{quote ? formatEur(quote.subtotalGrossCents) : "…"}</dd>
          </div>
          <div>
            <dt>{METHOD_LABEL[chosen]}</dt>
            <dd>
              {!quote ? "…" : quote.shippingCents === 0 ? "zdarma" : formatEur(quote.shippingCents)}
            </dd>
          </div>
          {quote?.totals.recap.map((r) => (
            <div key={r.vatRate} className={css.summaryVat}>
              <dt>
                Základ {r.vatRate} % / DPH {r.vatRate} %
              </dt>
              <dd>
                {formatEur(r.netCents)} / {formatEur(r.vatCents)}
              </dd>
            </div>
          ))}
        </dl>
        <p className={css.summaryTotal}>
          <span>Celkom k úhrade</span>
          <strong>{quote ? formatEur(quote.totals.grossCents) : "…"}</strong>
        </p>
        {quote && (
          <p className={css.summaryDelivery}>
            <Truck size={18} aria-hidden="true" />
            <span>
              Predpokladané doručenie <strong>{dateLabel(quote.estimatedDelivery)}</strong> · každý stroj pred odoslaním
              otestujeme. Ak by dodanie výnimočne trvalo dlhšie, budeme vás kontaktovať.
            </span>
          </p>
        )}

        <div className={css.payInfo}>
          <CreditCard size={20} aria-hidden="true" />
          <p>
            Platba kartou, Apple Pay alebo Google Pay cez Stripe. Sumu na karte <strong>len zablokujeme</strong> a
            strhneme ju, keď dodávateľ potvrdí dostupnosť. Ak tovar nebude dostupný, blokáciu uvoľníme.
            {demoPayments && <em> Demo: platobná brána nie je pripojená, platbu len nasimulujeme.</em>}
          </p>
        </div>

        <label className={css.checkRow} data-invalid={errors.terms ? true : undefined}>
          <input type="checkbox" name="terms" value="on" aria-describedby={errors.terms ? "co-terms-err" : undefined} />
          <span className={css.facetBox} aria-hidden="true" />
          <span>
            Súhlasím s <Link href="/obchodne-podmienky">obchodnými podmienkami</Link> a{" "}
            <Link href="/reklamacny-poriadok">reklamačným poriadkom</Link>.
          </span>
        </label>
        {errors.terms && (
          <p id="co-terms-err" className={css.fieldError}>
            {errors.terms}
          </p>
        )}
        <p className={css.legalNote}>
          {customerType === "person"
            ? "Ako spotrebiteľ máte právo odstúpiť od zmluvy do 14 dní od prevzatia tovaru bez udania dôvodu."
            : "Pri nákupe na firmu (IČO) sa zákonné právo na odstúpenie do 14 dní neuplatňuje."}{" "}
          Osobné údaje spracúvame podľa <Link href="/ochrana-osobnych-udajov">zásad ochrany osobných údajov</Link>.
        </p>

        <button type="submit" className={css.addBig} disabled={submitting || !quote}>
          <Lock size={20} aria-hidden="true" />
          {submitting ? "Odosielam…" : "Objednávka s povinnosťou platby"}
        </button>
      </aside>
    </form>
  );
}
