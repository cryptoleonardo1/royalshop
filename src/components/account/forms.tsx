"use client";

import { useActionState, useState, type ReactNode } from "react";
import { AlertTriangle, Building2, Check, User } from "lucide-react";
import {
  changePassword,
  deleteAccount,
  register,
  signIn,
  updateProfile,
  type FormState,
} from "@/lib/account/actions";
import type { Profile } from "@/lib/account/data";
import { PASSWORD_MIN } from "@/lib/account/schema";
import css from "@/components/shop/shop.module.css";

function Field({
  name,
  label,
  state,
  hint,
  children,
}: {
  name: string;
  label: string;
  state: FormState;
  hint?: string;
  children: (props: { id: string; name: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = `acc-${name}`;
  const error = state?.errors?.[name];
  const describedBy = [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={css.field} data-invalid={error ? true : undefined}>
      <label htmlFor={id}>{label}</label>
      {children({ id, name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && (
        <span id={`${id}-hint`} className={css.fieldHint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-err`} className={css.fieldError}>
          {error}
        </span>
      )}
    </div>
  );
}

function Messages({ state }: { state: FormState }) {
  return (
    <>
      {state?.message && (
        <p className={css.notice} role="alert">
          <AlertTriangle size={18} aria-hidden="true" /> {state.message}
        </p>
      )}
      {state?.ok && (
        <p className={css.okMsg} role="status">
          <Check size={18} strokeWidth={3} aria-hidden="true" /> {state.ok}
        </p>
      )}
    </>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className={css.authForm}>
      <input type="hidden" name="next" value={next} />
      <Messages state={state} />
      <Field name="email" label="E-mail" state={state}>
        {(p) => (
          <input {...p} type="email" autoComplete="username" inputMode="email" required defaultValue={state?.values?.email} />
        )}
      </Field>
      <Field name="password" label="Heslo" state={state}>
        {(p) => <input {...p} type="password" autoComplete="current-password" required />}
      </Field>
      <button type="submit" className={css.addBig} disabled={pending}>
        {pending ? "Prihlasujem…" : "Prihlásiť sa"}
      </button>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(register, undefined);
  const v = state?.values;
  return (
    <form action={action} className={css.authForm}>
      <input type="hidden" name="next" value={next} />
      <Messages state={state} />
      <div className={css.fieldGrid}>
        <Field name="firstName" label="Meno" state={state}>
          {(p) => <input {...p} autoComplete="given-name" required defaultValue={v?.firstName} />}
        </Field>
        <Field name="lastName" label="Priezvisko" state={state}>
          {(p) => <input {...p} autoComplete="family-name" required defaultValue={v?.lastName} />}
        </Field>
      </div>
      <Field name="email" label="E-mail" state={state}>
        {(p) => <input {...p} type="email" autoComplete="email" inputMode="email" required defaultValue={v?.email} />}
      </Field>
      <div className={css.fieldGrid}>
        <Field name="password" label="Heslo" state={state} hint={`Aspoň ${PASSWORD_MIN} znakov.`}>
          {(p) => <input {...p} type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />}
        </Field>
        <Field name="passwordAgain" label="Heslo znova" state={state}>
          {(p) => <input {...p} type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />}
        </Field>
      </div>
      <button type="submit" className={css.addBig} disabled={pending}>
        {pending ? "Vytváram účet…" : "Vytvoriť účet"}
      </button>
      <p className={css.legalNote}>
        Údaje z účtu spracúvame na vybavenie objednávok podľa{" "}
        <a href="/ochrana-osobnych-udajov">zásad ochrany osobných údajov</a>. Účet môžete kedykoľvek zrušiť v profile.
      </p>
    </form>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const v = state?.values;
  const [customerType, setCustomerType] = useState(profile.customerType);
  const val = (key: keyof Profile | "street" | "city" | "zip", fallback: string) => v?.[key] ?? fallback;
  return (
    <form action={action} className={css.coStep}>
      <h2 className={css.coLegend}>Osobné údaje</h2>
      <Messages state={state} />
      <div className={css.choiceRow}>
        {(
          [
            ["person", "Súkromná osoba", User],
            ["company", "Firma / živnostník", Building2],
          ] as const
        ).map(([value, label, Icon]) => (
          <label key={value} className={css.choice}>
            <input
              type="radio"
              name="customerType"
              value={value}
              checked={customerType === value}
              onChange={() => setCustomerType(value)}
            />
            <span className={css.choiceBody}>
              <Icon size={22} aria-hidden="true" />
              <strong>{label}</strong>
            </span>
          </label>
        ))}
      </div>
      <div className={css.fieldGrid}>
        <Field name="firstName" label="Meno" state={state}>
          {(p) => <input {...p} autoComplete="given-name" required defaultValue={val("firstName", profile.firstName)} />}
        </Field>
        <Field name="lastName" label="Priezvisko" state={state}>
          {(p) => <input {...p} autoComplete="family-name" required defaultValue={val("lastName", profile.lastName)} />}
        </Field>
        <div className={css.field}>
          <span className={css.fieldStatic}>E-mail</span>
          <span className={css.fieldValue}>{profile.email}</span>
        </div>
        <Field name="phone" label="Telefón" state={state}>
          {(p) => (
            <input {...p} type="tel" autoComplete="tel" inputMode="tel" placeholder="+421" defaultValue={val("phone", profile.phone)} />
          )}
        </Field>
      </div>
      {customerType === "company" && (
        <div className={css.fieldGrid}>
          <Field name="companyName" label="Obchodné meno" state={state}>
            {(p) => <input {...p} autoComplete="organization" required defaultValue={val("companyName", profile.companyName)} />}
          </Field>
          <Field name="ico" label="IČO" state={state}>
            {(p) => <input {...p} inputMode="numeric" required defaultValue={val("ico", profile.ico)} />}
          </Field>
          <Field name="dic" label="DIČ" state={state}>
            {(p) => <input {...p} inputMode="numeric" required defaultValue={val("dic", profile.dic)} />}
          </Field>
          <Field name="icDph" label="IČ DPH (ak ste platiteľ)" state={state}>
            {(p) => <input {...p} placeholder="SK" defaultValue={val("icDph", profile.icDph)} />}
          </Field>
        </div>
      )}
      <h3 className={css.fieldStatic}>Fakturačná adresa</h3>
      <div className={css.fieldGrid}>
        <Field name="street" label="Ulica a číslo" state={state}>
          {(p) => <input {...p} autoComplete="address-line1" defaultValue={val("street", profile.billing?.street ?? "")} />}
        </Field>
        <Field name="city" label="Mesto" state={state}>
          {(p) => <input {...p} autoComplete="address-level2" defaultValue={val("city", profile.billing?.city ?? "")} />}
        </Field>
        <Field name="zip" label="PSČ" state={state}>
          {(p) => (
            <input {...p} autoComplete="postal-code" inputMode="numeric" defaultValue={val("zip", profile.billing?.zip ?? "")} />
          )}
        </Field>
      </div>
      <button type="submit" className={css.btnPrimary} disabled={pending}>
        {pending ? "Ukladám…" : "Uložiť údaje"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className={css.coStep} key={state?.ok}>
      <h2 className={css.coLegend}>Zmena hesla</h2>
      <Messages state={state} />
      <Field name="currentPassword" label="Súčasné heslo" state={state}>
        {(p) => <input {...p} type="password" autoComplete="current-password" required />}
      </Field>
      <div className={css.fieldGrid}>
        <Field name="password" label="Nové heslo" state={state} hint={`Aspoň ${PASSWORD_MIN} znakov.`}>
          {(p) => <input {...p} type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />}
        </Field>
        <Field name="passwordAgain" label="Nové heslo znova" state={state}>
          {(p) => <input {...p} type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />}
        </Field>
      </div>
      <button type="submit" className={css.btnGhost} disabled={pending}>
        {pending ? "Mením…" : "Zmeniť heslo"}
      </button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  return (
    <form action={action} className={`${css.coStep} ${css.dangerZone}`}>
      <h2 className={css.coLegend}>Zrušenie účtu</h2>
      <Messages state={state} />
      <p>
        Zmažeme prihlasovacie údaje, profil a adresy. Objednávky a faktúry musíme podľa zákona uchovať, od účtu ich
        však odpojíme. Stav objednávky uvidíte aj naďalej cez odkaz z potvrdzujúceho e-mailu.
      </p>
      <label className={css.checkRow}>
        <input type="checkbox" name="confirm" value="on" required />
        <span className={css.facetBox} aria-hidden="true" />
        <span>Rozumiem, chcem účet natrvalo zrušiť.</span>
      </label>
      {state?.errors?.confirm && <span className={css.fieldError}>{state.errors.confirm}</span>}
      <button type="submit" className={css.btnGhost} disabled={pending}>
        {pending ? "Ruším účet…" : "Zrušiť účet"}
      </button>
    </form>
  );
}
