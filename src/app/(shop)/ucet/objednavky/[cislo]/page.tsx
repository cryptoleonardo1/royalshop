import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCustomer } from "@/lib/account/auth";
import { getMyOrder } from "@/lib/account/data";
import { getShopSettings } from "@/lib/catalog";
import { formatDateTime } from "@/lib/format";
import { OrderDetailView } from "@/components/shop/order-detail";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Objednávka", robots: { index: false, follow: false } };

async function AccountOrder({ params }: PageProps<"/ucet/objednavky/[cislo]">) {
  const number = decodeURIComponent((await params).cislo);
  const customer = await requireCustomer(`/ucet/objednavky/${number}`);
  const [order, settings] = await Promise.all([getMyOrder(customer.id, number), getShopSettings()]);
  if (!order) notFound();

  return (
    <>
      <header className={css.pageHead}>
        <nav aria-label="Omrvinky">
          <ol className={css.crumbs}>
            <li>
              <Link href="/ucet">Moje objednávky</Link>
            </li>
            <li aria-current="page">{order.orderNumber}</li>
          </ol>
        </nav>
        <h1 className={css.pageTitle}>Objednávka {order.orderNumber}</h1>
        <p className={css.pageLede}>Vytvorená {formatDateTime(order.createdAt)}.</p>
      </header>
      <OrderDetailView order={order} shopPhone={settings.phone} />
    </>
  );
}

export default function AccountOrderPage(props: PageProps<"/ucet/objednavky/[cislo]">) {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <Suspense fallback={<p className={css.resultCount}>Načítavam objednávku…</p>}>
        <AccountOrder {...props} />
      </Suspense>
    </div>
  );
}
