import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import css from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "Prihlásenie" };

export default function LoginPage() {
  return (
    <div className={css.loginWrap}>
      <div className={css.loginCard}>
        <h1 className={css.title}>Royal Shop</h1>
        <p className={css.sub}>Administrácia e-shopu. Prístup majú iba poverení pracovníci.</p>
        <LoginForm />
      </div>
    </div>
  );
}
