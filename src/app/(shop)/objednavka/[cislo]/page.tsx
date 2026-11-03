import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserPlus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmCheckoutReturn } from "@/lib/orders";
import { loadOrderDetail } from "@/lib/order-detail";
import { getShopSettings } from "@/lib/catalog";
import { getCustomer } from "@/lib/account/auth";
import { claimOrder } from "@/lib/account/actions";
import { ClearCart } from "@/components/shop/clear-cart";
import { OrderDetailView } from "@/components/shop/order-detail";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Objednávka", robots: { index: false, follow: false } };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function OrderView({ params, searchParams }: PageProps<"/objednavka/[cislo]">) {
  const [{ cislo }, sp] = await Promise.all([params, searchParams]);
  const token = first(sp.t);
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();

  const db = createAdminClient();
  const number = decodeURIComponent(cislo);
  let order = await loadOrderDetail(db, number, { token });
  if (!order) notFound();

  const sessionId = first(sp.session_id);
  if (order.status === "pending_payment" && sessionId) {
    await confirmCheckoutReturn(db, order.id, sessionId);
    order = await loadOrderDetail(db, number, { token });
    if (!order) notFound();
  }

  const [settings, customer] = await Promise.all([getShopSettings(), getCustomer()]);
  const isNew = first(sp.novy) === "1";
  const here = `/objednavka/${order.orderNumber}?t=${order.accessToken}`;

  const accountBox =
    customer && order.profileId === customer.id ? (
      <Link href={`/ucet/objednavky/${order.orderNumber}`} className={css.gpsrLink}>
        Zobraziť v mojom účte
      </Link>
    ) : customer && !order.profileId ? (
      <form action={claimOrder} className={css.claimBox}>
        <input type="hidden" name="number" value={order.orderNumber} />
        <input type="hidden" name="token" value={order.accessToken} />
        <button type="submit" className={css.btnGhost}>
          <UserPlus size={18} aria-hidden="true" /> Uložiť do môjho účtu
        </button>
      </form>
    ) : !customer ? (
      <p className={css.claimBox}>
        <Link href={`/ucet/prihlasenie?next=${encodeURIComponent(here)}`}>Prihláste sa</Link> alebo si{" "}
        <Link href={`/ucet/registracia?next=${encodeURIComponent(here)}`}>vytvorte účet</Link> a objednávku si uložte.
        Všetky objednávky potom nájdete na jednom mieste.
      </p>
    ) : null;

  const reservation = order.status === "reserved";

  return (
    <>
      {isNew && <ClearCart />}
      <header className={css.pageHead}>
        <p className={css.tape}>Objednávka {order.orderNumber}</p>
        <h1 className={css.pageTitle}>
          {isNew && order.status !== "cancelled"
            ? reservation
              ? "Ďakujeme za rezerváciu"
              : "Ďakujeme za objednávku"
            : reservation
              ? "Stav rezervácie"
              : "Stav objednávky"}
        </h1>
        <p className={css.pageLede}>
          {reservation ? "Rezervácia" : "Objednávka"} je zaevidovaná na <strong>{order.email}</strong>. Odkaz na túto
          stránku si uložte, stav na nej uvidíte aj neskôr.
        </p>
      </header>
      <OrderDetailView
        order={order}
        shopPhone={settings.phone}
        paymentCancelled={first(sp.platba) === "zrusena"}
        aside={accountBox}
      />
    </>
  );
}

export default function OrderPage(props: PageProps<"/objednavka/[cislo]">) {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <Suspense fallback={<p className={css.resultCount}>Načítavam objednávku…</p>}>
        <OrderView {...props} />
      </Suspense>
    </div>
  );
}
