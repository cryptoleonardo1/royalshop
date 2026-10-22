import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getCategoryContext, getCategoryProducts, getShopSettings } from "@/lib/catalog";
import { ListingSkeleton, ListingView } from "@/components/shop/listing-view";
import { HondaEnginePriceList } from "@/components/shop/honda-engine-pricelist";
import css from "@/components/shop/shop.module.css";

// The engines category also lists every Honda GX variant from the official price list.
const ENGINE_CATEGORY = "motory";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.filter((c) => c.productCount > 0).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/kategoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await getCategoryContext(slug);
  if (!ctx) return { title: "Kategória nenájdená" };
  return { title: ctx.category.name, description: ctx.category.description ?? undefined };
}

async function CategoryHeader({ params }: Pick<PageProps<"/kategoria/[slug]">, "params">) {
  const { slug } = await params;
  const ctx = await getCategoryContext(slug);
  if (!ctx) notFound();
  const { category, ancestors, children, siblings } = ctx;
  const subnav = children.length > 0 ? children : siblings;

  return (
    <header className={css.pageHead}>
      <nav aria-label="Omrvinky">
        <ol className={css.crumbs}>
          <li>
            <Link href="/">Domov</Link>
          </li>
          {ancestors.map((a) => (
            <li key={a.slug}>
              <Link href={`/kategoria/${a.slug}`}>{a.name}</Link>
            </li>
          ))}
          <li aria-current="page">{category.name}</li>
        </ol>
      </nav>
      <h1 className={css.pageTitle}>{category.name}</h1>
      {category.description && <p className={css.pageLede}>{category.description}</p>}
      {subnav.length > 0 && (
        <ul className={css.subcats} aria-label={children.length > 0 ? "Podkategórie" : "Súvisiace kategórie"}>
          {subnav.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/kategoria/${c.slug}`}
                className={css.subcat}
                aria-current={c.slug === category.slug ? "page" : undefined}
              >
                {c.name} <span>{c.productCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

async function CategoryListing({ params, searchParams }: PageProps<"/kategoria/[slug]">) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const [products, settings] = await Promise.all([getCategoryProducts(slug), getShopSettings()]);
  return (
    <>
      <ListingView
        products={products}
        searchParams={sp}
        basePath={`/kategoria/${slug}`}
        handlingDays={settings.handlingDays}
      />
      {slug === ENGINE_CATEGORY && (
        <HondaEnginePriceList
          offered={
            new Map(
              products
                .filter((p) => p.sku)
                .map((p) => [p.sku!, { slug: p.slug, name: p.name, image: p.image?.path ?? null }]),
            )
          }
          phone={settings.phone}
        />
      )}
    </>
  );
}

export default function CategoryPage(props: PageProps<"/kategoria/[slug]">) {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <Suspense fallback={<div className={css.pageHeadSkeleton} aria-hidden="true" />}>
        <CategoryHeader params={props.params} />
      </Suspense>
      <Suspense fallback={<ListingSkeleton />}>
        <CategoryListing {...props} />
      </Suspense>
    </div>
  );
}
