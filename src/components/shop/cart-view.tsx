"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Minus, Plus, ShoppingCart, Trash2, Truck } from "lucide-react";
import { MAX_QTY, removeFromCart, setQuantity } from "@/lib/cart-store";
import { formatEur } from "@/lib/money";
import { formatDeliveryDate } from "@/lib/format";
import { useHydrated, useQuote } from "./use-quote";
import css from "./shop.module.css";

const plural = (n: number) => (n === 1 ? "kus" : n >= 2 && n <= 4 ? "kusy" : "kusov");

export function CartView({ cheapestZoneCents }: { cheapestZoneCents: number | null }) {
  const hydrated = useHydrated();
  const { lines, quote, loading, removed } = useQuote();

  if (!hydrated) return <p className={css.resultCount}>Načítavam košík…</p>;

  if (lines.length === 0) {
    return (
      <div className={css.empty}>
        <ShoppingCart size={40} aria-hidden="true" />
        <p className={css.emptyTitle}>Košík je prázdny</p>
        {removed.length > 0 && <p>Odstránili sme produkty, ktoré už nepredávame: {removed.join(", ")}.</p>}
        <Link href="/produkty" className={css.btnPrimary}>
          Prezrieť sortiment <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const priced = new Map(quote?.lines.map((l) => [l.product.slug, l]));
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const courier = quote?.options.find((o) => o.method === "courier");
  const ownTransport = quote?.options.find((o) => o.method === "own_transport");
  const progress = quote
    ? Math.min(100, Math.round((quote.subtotalGrossCents / quote.freeShippingThresholdCents) * 100))
    : 0;

  return (
    <div className={css.cartLayout} data-loading={loading || undefined}>
      <section aria-labelledby="cart-items-title">
        <h2 id="cart-items-title" className={css.srOnly}>
          Položky v košíku
        </h2>
        {removed.length > 0 && (
          <p className={css.notice}>
            <AlertTriangle size={18} aria-hidden="true" /> Odstránili sme produkty, ktoré už nepredávame:{" "}
            {removed.join(", ")}.
          </p>
        )}
        <ul className={css.cartLines}>
          {lines.map((line) => {
            const p = priced.get(line.slug);
            const unit = p?.product.priceGrossCents ?? line.priceGrossCents;
            const image = p?.product.image ?? line.image;
            return (
              <li key={line.slug} className={css.cartLine}>
                <Link href={`/produkt/${line.slug}`} className={css.cartThumb} tabIndex={-1} aria-hidden="true">
                  {image ? <Image src={image} alt="" fill sizes="96px" className={css.productImg} /> : null}
                </Link>
                <div className={css.cartLineInfo}>
                  <Link href={`/produkt/${line.slug}`} className={css.cartLineName}>
                    {p?.product.name ?? line.name}
                  </Link>
                  {line.sku && <span className={css.cartLineSku}>Kód {line.sku}</span>}
                  {p?.product.shippingClass === "own_transport" && (
                    <span className={css.cartLineNote}>
                      <Truck size={14} aria-hidden="true" /> Ťažký stroj – vlastný rozvoz alebo odber v Senci
                    </span>
                  )}
                  <span className={css.cartLineUnit}>{formatEur(unit)} / ks</span>
                </div>
                <div className={css.stepper} role="group" aria-label={`Množstvo: ${line.name}`}>
                  <button
                    type="button"
                    className={css.stepBtn}
                    onClick={() => setQuantity(line.slug, line.quantity - 1)}
                    disabled={line.quantity <= 1}
                    aria-label="Znížiť množstvo"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <input
                    className={css.qtyInput}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_QTY}
                    value={line.quantity}
                    aria-label="Počet kusov"
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isFinite(n) && n >= 1) setQuantity(line.slug, n);
                    }}
                  />
                  <button
                    type="button"
                    className={css.stepBtn}
                    onClick={() => setQuantity(line.slug, line.quantity + 1)}
                    disabled={line.quantity >= MAX_QTY}
                    aria-label="Zvýšiť množstvo"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>
                <p className={css.cartLineTotal}>{formatEur(p?.lineGrossCents ?? unit * line.quantity)}</p>
                <button
                  type="button"
                  className={css.cartRemove}
                  onClick={() => removeFromCart(line.slug)}
                  aria-label={`Odstrániť z košíka: ${line.name}`}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className={css.summary} aria-labelledby="cart-summary-title">
        <h2 id="cart-summary-title" className={css.summaryTitle}>
          Súhrn
        </h2>
        <dl className={css.summaryRows}>
          <div>
            <dt>
              Tovar ({count} {plural(count)})
            </dt>
            <dd>{quote ? formatEur(quote.subtotalGrossCents) : "…"}</dd>
          </div>
          <div>
            <dt>Doprava</dt>
            <dd>
              {!quote
                ? "…"
                : quote.remainingForFreeShippingCents === 0
                  ? "zdarma"
                  : courier
                    ? `kuriér ${formatEur(courier.priceCents ?? 0)}`
                    : ownTransport && cheapestZoneCents != null
                      ? `rozvoz od ${formatEur(cheapestZoneCents)}`
                      : "podľa výberu"}
            </dd>
          </div>
          <div>
            <dt>Osobný odber Senec</dt>
            <dd>zdarma</dd>
          </div>
        </dl>

        {quote && quote.remainingForFreeShippingCents > 0 && (
          <div className={css.freeShip}>
            <p>
              Do dopravy zdarma zostáva <strong>{formatEur(quote.remainingForFreeShippingCents)}</strong>
            </p>
            <span className={css.freeShipBar} aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </span>
          </div>
        )}

        {quote && (
          <>
            <p className={css.summaryTotal}>
              <span>Spolu s DPH</span>
              <strong>{formatEur(quote.subtotalGrossCents)}</strong>
            </p>
            <p className={css.summaryNote}>
              z toho DPH {formatEur(quote.lines.reduce((s, l) => s + l.lineVatCents, 0))} · doprava sa vyberá v pokladni
            </p>
            <p className={css.summaryDelivery}>
              <Truck size={18} aria-hidden="true" />
              <span>
                Predpokladané doručenie{" "}
                <strong>{formatDeliveryDate(new Date(`${quote.options[0].estimatedDelivery}T12:00:00Z`))}</strong>{" "}
                vrátane testu pred odoslaním
              </span>
            </p>
          </>
        )}

        <Link href="/pokladna" className={css.btnPrimary} aria-disabled={!quote || undefined}>
          Pokračovať k pokladni <ArrowRight size={20} aria-hidden="true" />
        </Link>
        <Link href="/produkty" className={css.summaryBack}>
          Pokračovať v nákupe
        </Link>
      </aside>
    </div>
  );
}
