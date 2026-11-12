import Link from "next/link";
import { ArrowLeft, ArrowRight, SearchX, X } from "lucide-react";
import type { ProductSummary } from "@/lib/catalog";
import { buildListing, listingHref, listingHrefWithout, pagerPages, type SearchParams } from "@/lib/listing";
import { ProductGrid } from "./product-card";
import { FilterPanel, SortSelect } from "./filters";
import { PageLink } from "./listing-nav";
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
  // page links go through PageLink: the view lands on the top of the listing, not on the top of the page
  const pageHref = (n: number) => listingHref(basePath, searchParams, { strana: n > 1 ? String(n) : null });
  const prevHref = filters.page > 1 ? pageHref(filters.page - 1) : null;
  const nextHref = filters.page < pageCount ? pageHref(filters.page + 1) : null;

  return (
    <div className={css.listing} data-listing>
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
          {pageCount > 1 && (
            <nav className={css.pagerTop} aria-label="Stránkovanie hore">
              {prevHref ? (
                <PageLink href={prevHref} aria-label="Predchádzajúca strana">
                  <ArrowLeft size={18} aria-hidden="true" />
                </PageLink>
              ) : (
                <span aria-hidden="true">
                  <ArrowLeft size={18} />
                </span>
              )}
              <p>
                <span className={css.srOnly}>Strana </span>
                <strong>{filters.page}</strong> / {pageCount}
              </p>
              {nextHref ? (
                <PageLink href={nextHref} aria-label="Ďalšia strana">
                  <ArrowRight size={18} aria-hidden="true" />
                </PageLink>
              ) : (
                <span aria-hidden="true">
                  <ArrowRight size={18} />
                </span>
              )}
            </nav>
          )}
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
            {prevHref ? (
              <PageLink href={prevHref}>
                <ArrowLeft size={18} aria-hidden="true" /> Predchádzajúca
              </PageLink>
            ) : (
              <span />
            )}
            <ol>
              {pagerPages(filters.page, pageCount).map((n, i) =>
                n == null ? (
                  <li key={`gap-${i}`} className={css.pagerGap} aria-hidden="true">
                    …
                  </li>
                ) : (
                  <li key={n}>
                    <PageLink
                      href={pageHref(n)}
                      aria-current={n === filters.page ? "page" : undefined}
                      aria-label={`Strana ${n}`}
                    >
                      {n}
                    </PageLink>
                  </li>
                ),
              )}
            </ol>
            {nextHref ? (
              <PageLink href={nextHref}>
                Ďalšia <ArrowRight size={18} aria-hidden="true" />
              </PageLink>
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
