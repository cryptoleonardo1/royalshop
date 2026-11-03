"use client";

import { useActionState } from "react";
import { formatEur } from "@/lib/money";
import { RETURN_STATUS_LABELS, type OrderLine, type ReturnStatus } from "@/lib/returns";
import {
  advanceReturn,
  createManualReturn,
  refundReturn,
  saveReturnNote,
  type ReturnActionState,
} from "@/lib/admin/return-actions";
import css from "./admin.module.css";

const STEP_HINT: Partial<Record<ReturnStatus, string>> = {
  awaiting_goods: "Zákazník stroj posiela alebo ho prinesie. Peniaze môžete vrátiť už vtedy, keď preukáže odoslanie.",
  goods_received: "Stroj je späť u nás. Hneď pri prevzatí zdokumentujte stav (fotky, motohodiny, porovnanie s protokolom).",
  inspected: "Stav vráteného stroja je zdokumentovaný.",
};

function Message({ state }: { state: ReturnActionState }) {
  if (!state?.message) return null;
  return (
    <p className={css.msg} data-ok={state.ok ? "true" : undefined} role={state.ok ? "status" : "alert"}>
      {state.message}
    </p>
  );
}

function StepForm({ returnId, from, to }: { returnId: string; from: ReturnStatus; to: ReturnStatus }) {
  const [state, action, pending] = useActionState(advanceReturn, undefined);
  return (
    <form action={action} className={css.form}>
      <input type="hidden" name="returnId" value={returnId} />
      <input type="hidden" name="from" value={from} />
      <input type="hidden" name="to" value={to} />
      <p className={`${css.small} ${css.muted}`} style={{ margin: 0 }}>
        {STEP_HINT[to]}
      </p>
      <Message state={state} />
      <button type="submit" className={`${css.btn} ${css.btnGhost}`} disabled={pending}>
        {pending ? "Ukladám…" : `→ ${RETURN_STATUS_LABELS[to]}`}
      </button>
    </form>
  );
}

export function ReturnSteps({ returnId, status, steps }: { returnId: string; status: ReturnStatus; steps: ReturnStatus[] }) {
  const plain = steps.filter((s) => s !== "rejected");
  return (
    <div className={css.stack}>
      {plain.map((to) => (
        <StepForm key={to} returnId={returnId} from={status} to={to} />
      ))}
      {steps.includes("rejected") && <RejectForm returnId={returnId} status={status} />}
    </div>
  );
}

function RejectForm({ returnId, status }: { returnId: string; status: ReturnStatus }) {
  const [state, action, pending] = useActionState(advanceReturn, undefined);
  return (
    <details className={css.danger}>
      <summary>Zamietnuť odstúpenie</summary>
      <form action={action} className={css.form} style={{ marginTop: 10 }}>
        <input type="hidden" name="returnId" value={returnId} />
        <input type="hidden" name="from" value={status} />
        <input type="hidden" name="to" value="rejected" />
        <p className={`${css.small} ${css.muted}`} style={{ margin: 0 }}>
          Len výnimočne, napríklad duplicitné podanie alebo odoslané po lehote. Zákazníkovi dôvod oznámte písomne.
        </p>
        <label className={css.field}>
          Dôvod
          <input className={css.input} name="reason" required />
        </label>
        <Message state={state} />
        <button type="submit" className={`${css.btn} ${css.btnDanger}`} disabled={pending}>
          {pending ? "Ukladám…" : "Zamietnuť"}
        </button>
      </form>
    </details>
  );
}

export function RefundForm({
  returnId,
  status,
  suggestedCents,
  refundableCents,
  wholeOrder,
}: {
  returnId: string;
  status: ReturnStatus;
  suggestedCents: number;
  refundableCents: number;
  wholeOrder: boolean;
}) {
  const [state, action, pending] = useActionState(refundReturn, undefined);
  if (refundableCents === 0) {
    return (
      <form action={action} className={css.form}>
        <input type="hidden" name="returnId" value={returnId} />
        <input type="hidden" name="from" value={status} />
        <p className={`${css.small} ${css.muted}`} style={{ margin: 0 }}>
          Na objednávke nie je čo vrátiť (platba už bola vrátená alebo neprebehla).
        </p>
        <label className={css.check}>
          <input type="checkbox" name="confirm" required />
          <span>Uzavrieť odstúpenie ako vybavené bez ďalšej platby.</span>
        </label>
        <Message state={state} />
        <button type="submit" className={css.btn} disabled={pending}>
          {pending ? "Ukladám…" : "Uzavrieť"}
        </button>
      </form>
    );
  }
  return (
    <form action={action} className={css.form}>
      <input type="hidden" name="returnId" value={returnId} />
      <input type="hidden" name="from" value={status} />
      <p className={`${css.small} ${css.muted}`} style={{ margin: 0 }}>
        Navrhovaná suma {formatEur(suggestedCents)}
        {wholeOrder ? " (celá objednávka vrátane dopravy)" : " (len vrátené položky, bez dopravy)"}. Na objednávke je ešte{" "}
        {formatEur(refundableCents)}. Zníženie hodnoty stroja <strong>neodpočítavajte</strong> (§ 22 ods. 8 ZOS), vymáhajte ho
        samostatne.
      </p>
      <label className={css.field}>
        Suma na vrátenie (€)
        <input
          className={css.input}
          name="amount"
          inputMode="decimal"
          defaultValue={(suggestedCents / 100).toFixed(2).replace(".", ",")}
          required
        />
      </label>
      <label className={css.field}>
        Zdôvodnenie (povinné pri nižšej sume)
        <input className={css.input} name="reason" placeholder="napr. príplatok za expresné doručenie sa nevracia" />
      </label>
      <label className={css.check}>
        <input type="checkbox" name="confirm" required />
        <span>Peniaze sa hneď vrátia na kartu zákazníka cez Stripe. Nedá sa to vrátiť späť.</span>
      </label>
      <Message state={state} />
      <button type="submit" className={css.btn} disabled={pending}>
        {pending ? "Vraciam…" : "Vrátiť peniaze"}
      </button>
    </form>
  );
}

export function ReturnNote({ returnId, note }: { returnId: string; note: string | null }) {
  const [state, action, pending] = useActionState(saveReturnNote, undefined);
  return (
    <form action={action} className={css.form}>
      <input type="hidden" name="returnId" value={returnId} />
      <textarea className={css.textarea} name="adminNote" defaultValue={note ?? ""} aria-label="Interná poznámka" placeholder="Vidí ju iba administrácia." />
      <Message state={state} />
      <button type="submit" className={`${css.btn} ${css.btnGhost}`} disabled={pending}>
        {pending ? "Ukladám…" : "Uložiť poznámku"}
      </button>
    </form>
  );
}

const nowBratislava = () => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Bratislava",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
};

// A withdrawal received by e-mail or letter (docs/04 §4.3: the admin must be able to enter it by hand).
export function ManualReturnForm({
  orderId,
  name,
  email,
  lines,
}: {
  orderId: string;
  name: string;
  email: string;
  lines: OrderLine[];
}) {
  const [state, action, pending] = useActionState(createManualReturn, undefined);
  return (
    <details>
      <summary className={css.small}>Zapísať odstúpenie prijaté e-mailom alebo listom</summary>
      <form action={action} className={css.form} style={{ marginTop: 10 }}>
        <input type="hidden" name="orderId" value={orderId} />
        <label className={css.field}>
          Odoslané zákazníkom (čas e-mailu, pečiatka pošty)
          <input
            className={css.input}
            type="datetime-local"
            name="submittedAt"
            defaultValue={nowBratislava()}
            max={nowBratislava()}
            required
            suppressHydrationWarning
          />
        </label>
        <div className={css.formRow}>
          <label className={css.field}>
            Meno
            <input className={css.input} name="name" defaultValue={name} required />
          </label>
          <label className={css.field}>
            E-mail
            <input className={css.input} type="email" name="email" defaultValue={email} required />
          </label>
        </div>
        <fieldset className={css.form} style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className={css.small}>Položky</legend>
          {lines.map((l) => (
            <label key={l.id} className={css.check}>
              <input type="checkbox" name="item" value={l.id} defaultChecked />
              <span>
                {l.quantity}× {l.name} · {formatEur(l.lineGrossCents)}
              </span>
            </label>
          ))}
        </fieldset>
        <label className={css.field}>
          Dôvod (ak ho uviedol)
          <input className={css.input} name="reason" />
        </label>
        <label className={css.field}>
          Ako prišlo (do internej poznámky)
          <input className={css.input} name="source" placeholder="napr. e-mail z 3. 11., list doporučene" />
        </label>
        <Message state={state} />
        <button type="submit" className={css.btn} disabled={pending}>
          {pending ? "Zapisujem…" : "Zapísať odstúpenie"}
        </button>
      </form>
    </details>
  );
}
