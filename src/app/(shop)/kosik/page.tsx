import type { Metadata } from "next";
import Link from "next/link";
import { getShippingZones } from "@/lib/catalog";
import { CartView } from "@/components/shop/cart-view";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Košík" };

export default async function CartPage() {
  const zones = await getShippingZones();
  const cheapestZone = zones.length ? Math.min(...zones.map((z) => z.price_cents)) : null;
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <header className={css.pageHead}>
        <nav aria-label="Omrvinky">
          <ol className={css.crumbs}>
            <li>
              <Link href="/">Domov</Link>
            </li>
            <li aria-current="page">Košík</li>
          </ol>
        </nav>
        <h1 className={css.pageTitle}>Košík</h1>
      </header>
      <CartView cheapestZoneCents={cheapestZone} />
    </div>
  );
}
