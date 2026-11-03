"use client";

import { useActionState, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Undo2 } from "lucide-react";
import { withdrawalStep, type WithdrawalFormState, type WithdrawalReview, type WithdrawalValues } from "@/lib/withdrawal-actions";
import { withdrawalNotice } from "@/lib/returns";
import { formatEur } from "@/lib/money";
import { formatDate } from "@/lib/format";
import css from "./shop.module.css";

// "Odstúpiť od zmluvy tu" (§ 20a ZOS). Step 1: name, order number, e-mail (+ optional reason). Step 2: the
// exact notice and the "Potvrdiť odstúpenie od zmluvy" button. Server side: src/lib/withdrawal-actions.ts.

const EMPTY: WithdrawalValues = { name: "", orderNumber: "", email: "", reason: "" };

function Field({
  name,
  label,
  error,
  hint,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  children: (p: { id: string; name: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = `wd-${name}`;
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

export function WithdrawalForm({ initial }: { initial?: Partial<WithdrawalValues> }) {
  const [state, action, pending] = useActionState<WithdrawalFormState, FormData>(withdrawalStep, {
    step: "identify",
    values: { ...EMPTY, ...initial },
  });
  const v = state.values;

  return (
    <div className={css.withdrawForm}>
      {state.message && (
        <p className={css.notice} role="alert">
          <AlertTriangle size={18} aria-hidden="true" /> {state.message}
        </p>
      )}
      {state.step === "review" && state.review ? (
        <ReviewStep key="review" state={state} review={state.review} action={action} pending={pending} />
      ) : (
        <form key={`identify-${v.orderNumber}-${v.email}`} action={action} className={css.authForm} noValidate>
          <p className={css.withdrawStep}>Krok 1 z 2 · Údaje objednávky</p>
          <div className={css.fieldGrid}>
            <Field name="name" label="Meno a priezvisko" error={state.errors?.name}>
              {(p) => <input {...p} autoComplete="name" required defaultValue={v.name} />}
            </Field>
            <Field
              name="orderNumber"
              label="Číslo objednávky"
              error={state.errors?.orderNumber}
              hint="Nájdete ho v e-maile a na stránke objednávky, napríklad OBJ26-00012."
            >
              {(p) => <input {...p} required autoCapitalize="characters" defaultValue={v.orderNumber} />}
            </Field>
          </div>
          <Field name="email" label="E-mail" error={state.errors?.email} hint="Ten, ktorý ste zadali pri objednávke.">
            {(p) => <input {...p} type="email" inputMode="email" autoComplete="email" required defaultValue={v.email} />}
          </Field>
          <Field name="reason" label="Dôvod (nepovinné)" error={state.errors?.reason} hint="Dôvod uvádzať nemusíte.">
            {(p) => <textarea {...p} rows={3} maxLength={1000} defaultValue={v.reason} />}
          </Field>
          <button type="submit" name="intent" value="review" className={css.addBig} disabled={pending}>
            {pending ? "Overujem objednávku…" : "Pokračovať"} <ArrowRight size={20} aria-hidden="true" />
          </button>
          <p className={css.legalNote}>Povinné sú len meno a priezvisko, číslo objednávky a e-mail.</p>
        </form>
      )}
    </div>
  );
}

function ReviewStep({
  state,
  review,
  action,
  pending,
}: {
  state: WithdrawalFormState;
  review: WithdrawalReview;
  action: (form: FormData) => void;
  pending: boolean;
}) {
  const v = state.values;
  const [picked, setPicked] = useState(() => new Set(review.lines.map((l) => l.id)));
  const selected = review.lines.filter((l) => picked.has(l.id));
  const toggle = (id: string) =>
    setPicked((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const notice = withdrawalNotice({
    seller: review.seller,
    orderNumber: review.orderNumber,
    orderedAt: review.orderedAt,
    deliveredAt: review.deliveredAt,
    lines: selected,
    wholeOrder: !review.earlierWithdrawal && selected.length === review.lines.length,
    name: v.name,
    email: v.email,
    reason: v.reason || null,
    submittedAt: null,
    channel: "public_form",
  });

  return (
    <form action={action} className={css.authForm}>
      <p className={css.withdrawStep}>Krok 2 z 2 · Kontrola a potvrdenie</p>
      <input type="hidden" name="name" value={v.name} />
      <input type="hidden" name="orderNumber" value={v.orderNumber} />
      <input type="hidden" name="email" value={v.email} />
      <input type="hidden" name="reason" value={v.reason} />

      <p>
        Objednávka <strong>{review.orderNumber}</strong>{" "}
        {review.deadline
          ? `· lehota na odstúpenie plynie do ${formatDate(review.deadline)}${
              review.daysLeft === 0 ? " (dnes je posledný deň)" : ""
            }.`
          : "· tovar ešte nebol doručený, odstúpiť môžete už teraz."}
      </p>

      <fieldset className={css.withdrawItems} aria-describedby={state.errors?.item ? "wd-item-err" : undefined}>
        <legend className={css.fieldStatic}>Od čoho odstupujete</legend>
        {review.lines.map((l) => (
          <label key={l.id} className={css.checkRow} data-invalid={state.errors?.item ? true : undefined}>
            <input type="checkbox" name="item" value={l.id} checked={picked.has(l.id)} onChange={() => toggle(l.id)} />
            <span className={css.facetBox} aria-hidden="true" />
            <span>
              {l.quantity}× {l.name}
              <small className={css.withdrawPrice}>{formatEur(l.lineGrossCents)}</small>
            </span>
          </label>
        ))}
        {state.errors?.item && (
          <span id="wd-item-err" className={css.fieldError}>
            {state.errors.item}
          </span>
        )}
      </fieldset>

      <div>
        <p className={css.fieldStatic}>Toto nám odošlete</p>
        <blockquote className={css.withdrawPreview}>{notice}</blockquote>
      </div>

      <div className={css.withdrawActions}>
        <button type="submit" name="intent" value="confirm" className={css.addBig} disabled={pending || selected.length === 0}>
          <Undo2 size={20} aria-hidden="true" /> {pending ? "Odosielam…" : "Potvrdiť odstúpenie od zmluvy"}
        </button>
        <button type="submit" name="intent" value="back" className={css.btnGhost} disabled={pending} formNoValidate>
          <ArrowLeft size={18} aria-hidden="true" /> Späť
        </button>
      </div>
      <p className={css.legalNote}>
        Kliknutím na „Potvrdiť odstúpenie od zmluvy“ odstúpenie odošlete. Hneď potom uvidíte potvrdenie s jeho obsahom,
        dátumom a časom odoslania.
      </p>
    </form>
  );
}
