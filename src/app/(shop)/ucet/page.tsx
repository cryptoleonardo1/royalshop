import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { requireCustomer } from "@/lib/account/auth";
import { getMyOrders, getProfile } from "@/lib/account/data";
import { getShopSettings } from "@/lib/catalog";
import { formatEur } from "@/lib/money";
import { formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/order-state";
import { AccountNav } from "@/components/account/account-nav";
import { HelpCard } from "@/components/account/help-card";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Moje objednávky", robots: { index: false, follow: false } };

const DONE = new Set(["delivered", "completed", "cancelled"]);

async function Orders() {
  const customer = await requireCustomer("/ucet");
  const [orders, profile, settings] = await Promise.all([
    getMyOrders(customer.id),
    getProfile(customer.id),
    getShopSettings(),
  ]);
  const name = profile?.firstName || customer.email;

  return (
    <>
      <p className={`${css.pageLede} ${css.accountHello}`}>
        Dobrý deň, {name}. Tu nájdete svoje objednávky a ich aktuálny stav.
      </p>
      <div className={css.accountLayout}>
        <AccountNav current="orders" />
        <div className={css.orderMain}>
          {orders.length === 0 ? (
            <div className={css.empty}>
              <p className={css.emptyTitle}>Zatiaľ žiadne objednávky</p>
              <p>
                Objednávky z tohto účtu sa tu zobrazia automaticky. Staršiu objednávku pridáte tlačidlom „Uložiť do
                môjho účtu“ na stránke objednávky (odkaz máte v potvrdzujúcom e-maile).
              </p>
              <Link href="/produkty" className={css.btnPrimary}>
                Prezrieť sortiment <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <ul className={css.orderList}>
              {orders.map((o) => (
                <li key={o.orderNumber}>
                  <Link href={`/ucet/objednavky/${o.orderNumber}`} className={css.orderRow}>
                    <span className={css.orderRowHead}>
                      <strong>{o.orderNumber}</strong>
                      <span>{formatDateTime(o.createdAt)}</span>
                    </span>
                    <span className={css.orderRowItems}>
                      {o.firstItem}
                      {o.itemCount > 1 && ` a ďalšie (${o.itemCount - 1})`}
                    </span>
                    <span className={css.orderRowFoot}>
                      <span className={css.statusChip} data-done={DONE.has(o.status) || undefined}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                      <strong>{formatEur(o.totalGrossCents)}</strong>
                      <ChevronRight size={20} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <HelpCard settings={settings} hours={settings.pickupHours} />
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <header className={css.pageHead}>
        <p className={css.tape}>Môj účet</p>
        <h1 className={css.pageTitle}>Moje objednávky</h1>
      </header>
      <Suspense fallback={<p className={css.resultCount}>Načítavam objednávky…</p>}>
        <Orders />
      </Suspense>
    </div>
  );
}
