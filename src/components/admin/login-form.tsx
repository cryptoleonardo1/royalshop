"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/admin/auth-actions";
import css from "./admin.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className={css.form}>
      <label className={css.field}>
        E-mail
        <input className={css.input} type="email" name="email" autoComplete="username" required defaultValue={state?.email} />
      </label>
      <label className={css.field}>
        Heslo
        <input className={css.input} type="password" name="password" autoComplete="current-password" required />
      </label>
      {state?.message && (
        <p className={css.msg} role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" className={css.btn} disabled={pending}>
        {pending ? "Prihlasujem…" : "Prihlásiť sa"}
      </button>
    </form>
  );
}
