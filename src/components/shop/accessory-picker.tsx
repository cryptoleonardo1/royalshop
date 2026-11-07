import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/catalog";
import { formatSpecValue } from "@/lib/format";
import { formatEur } from "@/lib/money";
import { AddToCartButton } from "./cart-buttons";
import { Placeholder } from "./placeholder";
import css from "./shop.module.css";

// Spec keys a blade uses to tell the customer what it cuts and whether it fits.
const PICK_SPECS = ["material", "diameter_mm", "bore_mm"];

// Add-ons next to the buy box: the customer picks the blade for the material they cut.
export function AccessoryPicker({ items, note }: { items: ProductSummary[]; note: string }) {
  return (
    <section className={css.picker} aria-labelledby="picker-title">
      <h2 id="picker-title" className={css.pickerTitle}>
        Vyberte si diamantový kotúč
      </h2>
      <p className={css.pickerNote}>{note}</p>
      <ul className={css.pickerList}>
        {items.map((a) => {
          const specs = PICK_SPECS.map((k) => a.specs.find((s) => s.key === k)).filter((s) => s != null);
          return (
            <li key={a.slug} className={css.pickerItem}>
              <Link href={`/produkt/${a.slug}`} className={css.pickerMedia} tabIndex={-1} aria-hidden="true">
                {a.image ? (
                  <Image src={a.image.path} alt="" fill sizes="96px" className={css.productImg} />
                ) : (
                  <Placeholder sku={a.sku} name={a.name} categorySlug={a.category.slug} />
                )}
              </Link>
              <div className={css.pickerBody}>
                <Link href={`/produkt/${a.slug}`} className={css.pickerName}>
                  {a.name}
                </Link>
                {specs.length > 0 && (
                  <p className={css.pickerSpecs}>{specs.map((s) => formatSpecValue(s.value, s.unit)).join(" · ")}</p>
                )}
              </div>
              <div className={css.pickerBuy}>
                <p className={css.pickerPrice}>{formatEur(a.priceGrossCents)}</p>
                <AddToCartButton
                  item={{ slug: a.slug, name: a.name, sku: a.sku, priceGrossCents: a.priceGrossCents, image: a.image?.path ?? null }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
