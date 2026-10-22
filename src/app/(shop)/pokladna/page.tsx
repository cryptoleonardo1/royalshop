import type { Metadata } from "next";
import Link from "next/link";
import { getShopSettings } from "@/lib/catalog";
import { isDemoPayments } from "@/lib/stripe";
import { CheckoutForm } from "@/components/shop/checkout-form";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Pokladňa" };

export default async function CheckoutPage() {
  const settings = await getShopSettings();
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <header className={css.pageHead}>
        <nav aria-label="Omrvinky">
          <ol className={css.crumbs}>
            <li>
              <Link href="/">Domov</Link>
            </li>
            <li>
              <Link href="/kosik">Košík</Link>
            </li>
            <li aria-current="page">Pokladňa</li>
          </ol>
        </nav>
        <h1 className={css.pageTitle}>Pokladňa</h1>
      </header>
      <CheckoutForm
        pickupAddress={settings.pickupAddress}
        pickupHours={settings.pickupHours}
        demoPayments={isDemoPayments}
      />
    </div>
  );
}
