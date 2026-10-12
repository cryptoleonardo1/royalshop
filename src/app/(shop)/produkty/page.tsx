import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts, getShopSettings } from "@/lib/catalog";
import { ListingSkeleton, ListingView } from "@/components/shop/listing-view";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = {
  title: "Všetky produkty",
  description: "Celý sortiment stavebných strojov: vibračná technika, elektrocentrály, čerpadlá, rezacia technika, vibrátory, odvlhčovače a ohrievače.",
};

async function AllProductsListing({ searchParams }: Pick<PageProps<"/produkty">, "searchParams">) {
  const [sp, products, settings] = await Promise.all([searchParams, getAllProducts(), getShopSettings()]);
  return (
    <ListingView products={products} searchParams={sp} basePath="/produkty" handlingDays={settings.handlingDays} />
  );
}

export default function AllProductsPage(props: PageProps<"/produkty">) {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <header className={css.pageHead}>
        <nav aria-label="Omrvinky">
          <ol className={css.crumbs}>
            <li>
              <Link href="/">Domov</Link>
            </li>
            <li aria-current="page">Všetky produkty</li>
          </ol>
        </nav>
        <h1 className={css.pageTitle}>Celý sortiment</h1>
        <p className={css.pageLede}>
          Stavebné stroje, ktoré pred odoslaním naštartujeme a skontrolujeme. Filtrujte podľa značky, parametrov, ceny
          alebo dodacej lehoty.
        </p>
      </header>
      <Suspense fallback={<ListingSkeleton />}>
        <AllProductsListing searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
