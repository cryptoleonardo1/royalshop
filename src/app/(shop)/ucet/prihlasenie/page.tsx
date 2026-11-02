import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer, safeNext } from "@/lib/account/auth";
import { LoginForm } from "@/components/account/forms";
import { AccountPerks } from "@/components/account/account-perks";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Prihlásenie", robots: { index: false, follow: false } };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function Login({ searchParams }: PageProps<"/ucet/prihlasenie">) {
  const next = safeNext(first((await searchParams).next));
  if (await getCustomer()) redirect(next);
  return (
    <div className={css.authLayout}>
      <section className={css.coStep} aria-labelledby="login-title">
        <h2 id="login-title" className={css.coLegend}>
          Prihlásenie
        </h2>
        <LoginForm next={next} />
        <p className={css.authSwitch}>
          Nemáte účet? <Link href={`/ucet/registracia?next=${encodeURIComponent(next)}`}>Vytvorte si ho</Link>, trvá
          to minútu.
        </p>
      </section>
      <AccountPerks />
    </div>
  );
}

export default function LoginPage(props: PageProps<"/ucet/prihlasenie">) {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <header className={css.pageHead}>
        <p className={css.tape}>Môj účet</p>
        <h1 className={css.pageTitle}>Prihlásenie</h1>
      </header>
      <Suspense fallback={<p className={css.resultCount}>Načítavam…</p>}>
        <Login {...props} />
      </Suspense>
    </div>
  );
}
