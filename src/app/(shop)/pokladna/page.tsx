import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getShopSettings } from "@/lib/catalog";
import { isDemoPayments } from "@/lib/stripe";
import { getCustomer } from "@/lib/account/auth";
import { getProfile } from "@/lib/account/data";
import { CheckoutForm, type CheckoutPrefill } from "@/components/shop/checkout-form";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Pokladňa" };

// Signed-in customers: profile data prefilled, and the order joins their account (placeOrder).
async function Checkout() {
  const [settings, customer] = await Promise.all([getShopSettings(), getCustomer()]);
  const profile = customer ? await getProfile(customer.id) : null;
  const prefill: CheckoutPrefill | undefined = profile
    ? {
        customerType: profile.customerType,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        companyName: profile.companyName,
        ico: profile.ico,
        dic: profile.dic,
        icDph: profile.icDph,
        street: profile.billing?.street ?? "",
        city: profile.billing?.city ?? "",
        zip: profile.billing?.zip ?? "",
      }
    : undefined;
  return (
    <>
      {!customer && (
        <p className={css.authHint}>
          Máte účet? <Link href="/ucet/prihlasenie?next=/pokladna">Prihláste sa</Link> a údaje vám predvyplníme.
          Nakúpiť môžete aj bez účtu.
        </p>
      )}
      <CheckoutForm
        pickupAddress={settings.pickupAddress}
        pickupHours={settings.pickupHours}
        demoPayments={isDemoPayments}
        prefill={prefill}
      />
    </>
  );
}

export default function CheckoutPage() {
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
      <Suspense fallback={<p className={css.resultCount}>Načítavam pokladňu…</p>}>
        <Checkout />
      </Suspense>
    </div>
  );
}
