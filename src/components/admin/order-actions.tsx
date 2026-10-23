"use client";

import { useActionState } from "react";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-state";
import { advanceOrder, cancelOrder, saveAdminNote, type ActionState } from "@/lib/admin/order-actions";
import css from "./admin.module.css";

// What each next step means for the person clicking it.
const STEP_HINT: Partial<Record<OrderStatus, string>> = {
  confirmed: "Dodávateľ potvrdil dostupnosť. Tým vzniká zmluva (neskôr aj e-mail „Potvrdenie objednávky“ a faktúra).",
  ordered_from_supplier: "Stroj je objednaný u dodávateľa.",
  received_at_branch: "Stroj dorazil k nám do Boldogu.",
  tested: "Stroj je otestovaný a zabalený (protokol pribudne vo fáze 2).",
  shipped: "Odovzdané kuriérovi.",
  out_for_delivery: "Vezieme vlastným rozvozom.",
  ready_for_pickup: "Zákazník si môže stroj vyzdvihnúť.",
  delivered: "Zákazník stroj prevzal. Spotrebiteľovi od tohto dňa plynie 14-dňová lehota na odstúpenie.",
  completed: "Objednávka je uzavretá.",
};

function Message({ state }: { state: ActionState }) {
  if (!state?.message) return null;
  return (
    <p className={css.msg} data-ok={state.ok ? "true" : undefined} role={state.ok ? "status" : "alert"}>
      {state.message}
    </p>
  );
}

const todayBratislava = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bratislava", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

function StepForm({ orderId, from, to, blocked }: { orderId: string; from: OrderStatus; to: OrderStatus; blocked?: string }) {
  const [state, action, pending] = useActionState(advanceOrder, undefined);
  return (
    <form action={action} className={css.form}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="from" value={from} />
      <input type="hidden" name="to" value={to} />
      <p className={`${css.small} ${css.muted}`} style={{ margin: 0 }}>
        {STEP_HINT[to]}
      </p>
      {to === "ordered_from_supplier" && (
        <div className={css.formRow}>
          <label className={css.field}>
            Číslo objednávky u dodávateľa
            <input className={css.input} name="reference" />
          </label>
          <label className={css.field}>
            Očakávané dodanie
            <input className={css.input} type="date" name="expectedAt" />
          </label>
        </div>
      )}
      {to === "shipped" && (
        <div className={css.formRow}>
          <label className={css.field}>
            Dopravca
            <input className={css.input} name="carrier" required placeholder="napr. DPD, GLS, TOPTRANS" />
          </label>
          <label className={css.field}>
            Číslo zásielky
            <input className={css.input} name="trackingNumber" />
          </label>
          <label className={css.field}>
            Odkaz na sledovanie
            <input className={css.input} type="url" name="trackingUrl" />
          </label>
        </div>
      )}
      {to === "delivered" && (
        <label className={css.field}>
          Dátum prevzatia zákazníkom
          <input className={css.input} type="date" name="deliveredAt" defaultValue={todayBratislava()} max={todayBratislava()} required />
        </label>
      )}
      <label className={css.field}>
        Poznámka do histórie (nepovinná)
        <input className={css.input} name="note" />
      </label>
      <Message state={state} />
      <button type="submit" className={css.btn} disabled={pending || Boolean(blocked)} title={blocked}>
        {pending ? "Ukladám…" : `→ ${ORDER_STATUS_LABELS[to]}`}
      </button>
      {blocked && <p className={`${css.small} ${css.muted}`} style={{ margin: 0 }}>{blocked}</p>}
    </form>
  );
}

export function NextSteps({
  orderId,
  status,
  next,
  completeBlocked,
}: {
  orderId: string;
  status: OrderStatus;
  next: OrderStatus[];
  completeBlocked?: string;
}) {
  const steps = next.filter((s) => s !== "cancelled");
  if (steps.length === 0) return <p className={`${css.muted} ${css.small}`} style={{ margin: 0 }}>Žiadny ďalší krok.</p>;
  return (
    <div className={css.stack}>
      {steps.map((to) => (
        <StepForm key={to} orderId={orderId} from={status} to={to} blocked={to === "completed" ? completeBlocked : undefined} />
      ))}
    </div>
  );
}

export function CancelOrder({ orderId, status, refundText }: { orderId: string; status: OrderStatus; refundText: string }) {
  const [state, action, pending] = useActionState(cancelOrder, undefined);
  return (
    <details className={css.danger}>
      <summary>Zrušiť objednávku</summary>
      <form action={action} className={css.form} style={{ marginTop: 10 }}>
        <input type="hidden" name="orderId" value={orderId} />
        <input type="hidden" name="from" value={status} />
        <label className={css.field}>
          Dôvod (uloží sa do histórie)
          <input className={css.input} name="reason" required placeholder="napr. dodávateľ nemá stroj na sklade" />
        </label>
        <label className={css.check}>
          <input type="checkbox" name="confirm" required />
          <span>{refundText}</span>
        </label>
        <Message state={state} />
        <button type="submit" className={`${css.btn} ${css.btnDanger}`} disabled={pending}>
          {pending ? "Ruším…" : "Zrušiť objednávku"}
        </button>
      </form>
    </details>
  );
}

export function AdminNote({ orderId, note }: { orderId: string; note: string | null }) {
  const [state, action, pending] = useActionState(saveAdminNote, undefined);
  return (
    <form action={action} className={css.form}>
      <input type="hidden" name="orderId" value={orderId} />
      <textarea className={css.textarea} name="adminNote" defaultValue={note ?? ""} aria-label="Interná poznámka" placeholder="Vidí ju iba administrácia." />
      <Message state={state} />
      <button type="submit" className={`${css.btn} ${css.btnGhost}`} disabled={pending}>
        {pending ? "Ukladám…" : "Uložiť poznámku"}
      </button>
    </form>
  );
}
