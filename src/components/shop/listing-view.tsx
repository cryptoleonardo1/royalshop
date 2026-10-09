import Link from "next/link";
import { ArrowLeft, ArrowRight, SearchX, X } from "lucide-react";
import type { ProductSummary } from "@/lib/catalog";
import { buildListing, listingHref, listingHrefWithout, type SearchParams } from "@/lib/listing";
import { ProductGrid } from "./product-card";
import { FilterPanel, SortSelect } from "./filters";
import css from "./shop.module.css";

const plural = (n: number) => (n === 1 ? "produkt" : n >= 2 && n <= 4 ? "produkty" : "produktov");

export function ListingView({
  products,
  searchParams,
  basePath,
  handlingDays,
  keep = [],
}: {
  products: ProductSummary[];
  searchParams: SearchParams;
  basePath: string;
  handlingDays: number;
  // search params that are part of the page itself (e.g. "q" on search) and survive "clear filters"
  keep?: string[];
}) {
  const listing = buildListing(products, searchParams, handlingDays);
  const { filters, facets, total, pageCount, items } = listing;
  const keepParams = Object.fromEntries(
    [...keep, "zoradit"].flatMap((k) => {
      const v = searchParams[k];
      const value = Array.isArray(v) ? v[0] : v;
      return value ? [[k, value]] : [];
    }),
  );
  const allParams = Object.fromEntries(
    Object.entries(searchParams).flatMap(([k, v]) => (v == null ? [] : [[k, Array.isArray(v) ? v : [v]]])),
  ) as Record<string, string[]>;

  const chips: { label: string; href: string }[] = [];
  for (const facet of facets) {
    for (const o of facet.options) {
      if (!o.checked) continue;
      chips.push({
        label: facet.options.length === 1 || facet.param.startsWith("p_") ? `${facet.label}: ${o.label}` : o.label,
        href: listingHrefWithout(basePath, searchParams, facet.param, o.value),
      });
    }
  }
  if (filters.priceMin != null || filters.priceMax != null) {
    chips.push({
      label: `Cena ${filters.priceMin ?? listing.price.min}–${filters.priceMax ?? listing.price.max} €`,
      href: listingHrefWithout(basePath, searchParams, ["cena_od", "cena_do"]),
    });
  }
  const clearHref = listingHref(basePath, {}, keepParams);

  return (
    <div className={css.listing}>
      <FilterPanel
        basePath={basePath}
        facets={facets}
        price={listing.price}
        priceMin={filters.priceMin}
        priceMax={filters.priceMax}
        keep={keepParams}
        activeCount={listing.activeCount}
        total={total}
      />

      <div className={css.listingMain}>
        <div className={css.toolbar}>
          <p className={css.resultCount} aria-live="polite">
            <strong>{total}</strong> {plural(total)}
          </p>
          <SortSelect value={filters.sort} params={allParams} />
        </div>

        {chips.length > 0 && (
          <ul className={css.chips} aria-label="Aktívne filtre">
            {chips.map((c) => (
              <li key={c.href + c.label}>
                <Link href={c.href} replace scroll={false} className={css.chip}>
                  {c.label}
                  <X size={14} aria-hidden="true" />
                  <span className={css.srOnly}> – zrušiť filter</span>
                </Link>
              </li>
            ))}
            {chips.length > 1 && (
              <li>
                <Link href={clearHref} replace scroll={false} className={css.chipClear}>
                  Zrušiť všetky
                </Link>
              </li>
            )}
          </ul>
        )}

        {items.length > 0 ? (
          <ProductGrid products={items} handlingDays={handlingDays} priorityCount={3} />
        ) : (
          <div className={css.empty}>
            <SearchX size={40} aria-hidden="true" />
            <p className={css.emptyTitle}>Nič také nemáme</p>
            <p>Skúste uvoľniť filtre alebo zmeniť cenové rozpätie.</p>
            {listing.activeCount > 0 && (
              <Link href={clearHref} className={css.btnGhost}>
                Zrušiť filtre
              </Link>
            )}
          </div>
        )}

        {pageCount > 1 && (
          <nav className={css.pager} aria-label="Stránkovanie">
            {filters.page > 1 ? (
              <Link
                href={listingHref(basePath, searchParams, {
                  strana: filters.page > 2 ? String(filters.page - 1) : null,
                })}
              >
                <ArrowLeft size={18} aria-hidden="true" /> Predchádzajúca
              </Link>
            ) : (
              <span />
            )}
            <ol>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <Link
                    href={listingHref(basePath, searchParams, { strana: n > 1 ? String(n) : null })}
                    aria-current={n === filters.page ? "page" : undefined}
                  >
                    {n}
                  </Link>
                </li>
              ))}
            </ol>
            {filters.page < pageCount ? (
              <Link href={listingHref(basePath, searchParams, { strana: String(filters.page + 1) })}>
                Ďalšia <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

// Static stand-in while a listing streams in (same footprint as the real grid).
export function ListingSkeleton() {
  return (
    <div className={css.listing} aria-busy="true">
      <div className={css.filtersSkeleton} aria-hidden="true" />
      <div className={css.listingMain}>
        <div className={css.toolbar}>
          <p className={css.resultCount}>Načítavam produkty…</p>
        </div>
        <div className={css.grid}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={css.cardSkeleton} />
          ))}
        </div>
      </div>
    </div>
  );
}
