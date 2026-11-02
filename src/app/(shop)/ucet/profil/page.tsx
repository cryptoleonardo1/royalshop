import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCustomer } from "@/lib/account/auth";
import { getProfile } from "@/lib/account/data";
import { AccountNav } from "@/components/account/account-nav";
import { DeleteAccountForm, PasswordForm, ProfileForm } from "@/components/account/forms";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = { title: "Profil a nastavenia", robots: { index: false, follow: false } };

async function Profile() {
  const customer = await requireCustomer("/ucet/profil");
  const profile = await getProfile(customer.id);
  if (!profile) notFound();
  return (
    <div className={css.accountLayout} data-wide>
      <AccountNav current="profile" />
      <div className={css.orderMain}>
        <ProfileForm profile={profile} />
        <PasswordForm />
        <DeleteAccountForm />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <header className={css.pageHead}>
        <p className={css.tape}>Môj účet</p>
        <h1 className={css.pageTitle}>Profil</h1>
      </header>
      <Suspense fallback={<p className={css.resultCount}>Načítavam profil…</p>}>
        <Profile />
      </Suspense>
    </div>
  );
}
