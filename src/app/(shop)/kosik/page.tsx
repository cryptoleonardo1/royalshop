import type { Metadata } from "next";
import Link from "next/link";
import { CartView } from "@/components/shop/cart-view";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Košík" };

export default function CartPage() {
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
      <CartView />
    </div>
  );
}
