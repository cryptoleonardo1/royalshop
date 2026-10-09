import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Check, Truck } from "lucide-react";
import type { ProductSummary } from "@/lib/catalog";
import { discountPct, referencePrice } from "@/lib/pricing";
import { formatEur, netFromGross } from "@/lib/money";
import { deliveryDays, formatSpecValue, PLATFORM_LABEL, workDaysText } from "@/lib/format";
import { Placeholder } from "./placeholder";
import { AddToCartButton } from "./cart-buttons";
import css from "./shop.module.css";

export const delay = (n: number) => ({ "--d": n }) as CSSProperties;

// Voltage is already on the platform chip; show the next most telling numbers.
const CARD_SPEC_SKIP = new Set(["voltage", "brushless", "batteries"]);

export function ProductCard({
  p,
  handlingDays,
  index = 0,
  priority = false,
}: {
  p: ProductSummary;
  handlingDays: number;
  index?: number;
  priority?: boolean;
}) {
  const off = discountPct(p);
  const ref = referencePrice(p);
  const days = deliveryDays(p.leadDays, handlingDays);
  const specs = p.specs.filter((s) => !CARD_SPEC_SKIP.has(s.key)).slice(0, 4);
  const href = `/produkt/${p.slug}`;
  const titleId = `p-${p.slug}`;

  return (
    <article className={`${css.card} ${css.rise}`} style={delay(Math.min(index, 8))} aria-labelledby={titleId}>
      <Link href={href} className={css.cardMedia} tabIndex={-1} aria-hidden="true">
        {p.image ? (
          <Image
            src={p.image.path}
            alt=""
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className={css.productImg}
            preload={priority}
          />
        ) : (
          <Placeholder sku={p.sku} name={p.name} categorySlug={p.category.slug} />
        )}
        <span className={css.cardBadges}>
          {off > 0 ? (
            <span className={css.saleBadge}>
              <span>Akcia −{off} %</span>
            </span>
          ) : p.isFeatured ? (
            <span className={css.tapeHi}>Odporúčame</span>
          ) : null}
        </span>
        <span className={css.qcMark} title="Otestované pred odoslaním">
          <Check size={14} strokeWidth={3} aria-hidden="true" /> QC
        </span>
      </Link>

      <div className={css.cardBody}>
        <div className={css.cardMeta}>
          <span className={css.brand}>{p.brand.name}</span>
          {p.batteryPlatform !== "none" && (
            <span className={p.batteryPlatform === "XGT_40V" ? css.chipXgt : css.chipLxt}>
              <BatteryCharging size={13} aria-hidden="true" />
              {PLATFORM_LABEL[p.batteryPlatform]}
            </span>
          )}
          {p.isKit && <span className={css.chipKit}>Sada s batériami</span>}
        </div>

        <h3 id={titleId} className={css.cardTitle}>
          <Link href={href} className={css.cardLink}>
            {p.name}
          </Link>
        </h3>
        {p.sku && (
          <span className={css.tape}>
            <span className={css.srOnly}>Kód: </span>
            {p.sku}
          </span>
        )}

        {specs.length > 0 && (
          <dl className={css.specs}>
            {specs.map((s) => (
              <div key={s.key}>
                <dt>{s.label}</dt>
                <dd>{formatSpecValue(s.value, s.unit)}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className={css.lead}>
          <Truck size={16} aria-hidden="true" />
          {p.shippingClass === "own_transport" ? "Vlastná doprava · " : "Doručenie "}
          {workDaysText(days.min, days.max)}
        </p>

        <div className={css.cardPrice}>
          {ref && (
            <p className={css.was}>
              <s>{formatEur(ref)}</s> <span className={css.wasNote}>najnižšia cena za 30 dní</span>
            </p>
          )}
          <p className={css.priceBig}>
            {formatEur(p.priceGrossCents)} <span className={css.vat}>s DPH</span>
          </p>
          <p className={css.priceNet}>{formatEur(netFromGross(p.priceGrossCents, p.vatRate))} bez DPH</p>
        </div>

        <AddToCartButton
          item={{
            slug: p.slug,
            name: p.name,
            sku: p.sku,
            priceGrossCents: p.priceGrossCents,
            image: p.image?.path ?? null,
          }}
        />
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  handlingDays,
  priorityCount = 0,
}: {
  products: ProductSummary[];
  handlingDays: number;
  priorityCount?: number;
}) {
  return (
    <div className={css.grid}>
      {products.map((p, i) => (
        <ProductCard key={p.slug} p={p} handlingDays={handlingDays} index={i} priority={i < priorityCount} />
      ))}
    </div>
  );
}
