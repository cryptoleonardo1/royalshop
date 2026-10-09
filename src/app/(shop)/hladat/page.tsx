import { Suspense } from "react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import { getShopSettings, searchProducts } from "@/lib/catalog";
import { ListingSkeleton, ListingView } from "@/components/shop/listing-view";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Vyhľadávanie" };

const firstParam = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

async function SearchResults({ searchParams }: Pick<PageProps<"/hladat">, "searchParams">) {
  const sp = await searchParams;
  const q = firstParam(sp.q).slice(0, 100);
  const [products, settings] = await Promise.all([q ? searchProducts(q) : Promise.resolve([]), getShopSettings()]);

  return (
    <>
      <header className={css.pageHead}>
        <h1 className={css.pageTitle}>{q ? <>Výsledky pre „{q}“</> : "Vyhľadávanie"}</h1>
        <Form action="/hladat" role="search" className={`${css.search} ${css.searchPage}`}>
          <label htmlFor="search-page" className={css.srOnly}>
            Hľadať v obchode
          </label>
          <input
            id="search-page"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Model, kód výrobcu alebo EAN"
            autoComplete="off"
            enterKeyHint="search"
            required
          />
          <button type="submit" aria-label="Hľadať">
            <Search size={20} aria-hidden="true" />
          </button>
        </Form>
      </header>

      {q && products.length > 0 ? (
        <ListingView
          products={products}
          searchParams={sp}
          basePath="/hladat"
          handlingDays={settings.handlingDays}
          keep={["q"]}
        />
      ) : q ? (
        <div className={css.empty}>
          <p className={css.emptyTitle}>Pre „{q}“ sme nič nenašli</p>
          <p>Skúste kratší výraz, kód výrobcu (napr. HR4013C) alebo EAN z krabice.</p>
          <Link href="/produkty" className={css.btnGhost}>
            Prezrieť celý sortiment
          </Link>
        </div>
      ) : (
        <p className={css.pageLede}>Zadajte názov stroja, kód výrobcu alebo EAN.</p>
      )}
    </>
  );
}

export default function SearchPage(props: PageProps<"/hladat">) {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <Suspense fallback={<ListingSkeleton />}>
        <SearchResults searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
