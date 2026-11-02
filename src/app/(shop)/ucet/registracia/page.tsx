import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer, safeNext } from "@/lib/account/auth";
import { RegisterForm } from "@/components/account/forms";
import { AccountPerks } from "@/components/account/account-perks";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Vytvoriť účet", robots: { index: false, follow: false } };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function Register({ searchParams }: PageProps<"/ucet/registracia">) {
  const next = safeNext(first((await searchParams).next));
  if (await getCustomer()) redirect(next);
  return (
    <div className={css.authLayout}>
      <section className={css.coStep} aria-labelledby="register-title">
        <h2 id="register-title" className={css.coLegend}>
          Nový účet
        </h2>
        <RegisterForm next={next} />
        <p className={css.authSwitch}>
          Už máte účet? <Link href={`/ucet/prihlasenie?next=${encodeURIComponent(next)}`}>Prihláste sa</Link>.
        </p>
      </section>
      <AccountPerks />
    </div>
  );
}

export default function RegisterPage(props: PageProps<"/ucet/registracia">) {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <header className={css.pageHead}>
        <p className={css.tape}>Môj účet</p>
        <h1 className={css.pageTitle}>Vytvoriť účet</h1>
        <p className={css.pageLede}>Nakupovať môžete aj bez účtu. S účtom máte objednávky a ich stav na jednom mieste.</p>
      </header>
      <Suspense fallback={<p className={css.resultCount}>Načítavam…</p>}>
        <Register {...props} />
      </Suspense>
    </div>
  );
}
