"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopSettings } from "@/lib/catalog";
import { getCustomer } from "@/lib/account/auth";
import type { FieldErrors } from "@/lib/checkout-schema";
import { formatDate } from "@/lib/format";
import { remainingLines, toReturnItems, withdrawalNotice, type OrderLine } from "@/lib/returns";
import { createReturn, findOrderForWithdrawal, sellerOf } from "@/lib/returns-server";
import { withdrawalEligibility } from "@/lib/withdrawal";

// "Odstúpiť od zmluvy tu" (§ 20a ZOS): works without login. Step 1 identifies the order (number + e-mail),
// step 2 shows what will be sent and has the "Potvrdiť odstúpenie od zmluvy" button. Only name, order
// number and e-mail are required; the reason is optional and never a condition.

export interface WithdrawalValues {
  name: string;
  orderNumber: string;
  email: string;
  reason: string;
}

export interface WithdrawalReview {
  orderNumber: string;
  orderedAt: string;
  deliveredAt: string | null;
  deadline: string | null; // null before delivery
  daysLeft: number | null;
  lines: OrderLine[]; // still open for withdrawal
  earlierWithdrawal: boolean;
  seller: { name: string; address: string; email: string | null };
}

export interface WithdrawalFormState {
  step: "identify" | "review";
  values: WithdrawalValues;
  errors?: FieldErrors;
  message?: string;
  review?: WithdrawalReview;
}

const schema = z.object({
  name: z.string().trim().min(1, "Zadajte meno a priezvisko").max(120, "Najviac 120 znakov"),
  orderNumber: z.string().trim().min(1, "Zadajte číslo objednávky").max(30, "Najviac 30 znakov"),
  email: z.string().trim().toLowerCase().pipe(z.email("Zadajte platný e-mail")),
  reason: z.string().trim().max(1000, "Najviac 1000 znakov"),
});

const NOT_FOUND =
  "Objednávku s týmto číslom a e-mailom sme nenašli. Skontrolujte číslo objednávky (napríklad OBJ26-00012) a e-mail, ktorý ste zadali pri objednávke.";

const BLOCKED: Record<string, (deadline: string | null) => string> = {
  unpaid: () =>
    "Objednávka ešte nie je zaplatená, zmluva nevznikla. Ak ju nechcete, stačí ju nezaplatiť alebo nám dať vedieť, že rezerváciu rušíte.",
  cancelled: () => "Táto objednávka je zrušená. Ak ste ju zaplatili, peniaze vám vrátime bez odstúpenia.",
  company: () =>
    "Objednávka je vystavená na firmu. Zákonné právo odstúpiť od zmluvy má len spotrebiteľ. Ak chcete nepoužitý stroj vrátiť, ozvite sa nám, posúdime to podľa obchodných podmienok.",
  on_premises: () =>
    "Kúpnu zmluvu ste uzavreli osobne v našej predajni. Zákonné právo odstúpiť do 14 dní platí len pri nákupe na diaľku (e-shop, telefón, e-mail). Ak má stroj vadu, môžete ho reklamovať podľa reklamačného poriadku.",
  expired: (d) =>
    `Lehota na odstúpenie od zmluvy uplynula${d ? ` dňa ${formatDate(d)}` : ""}. Ak má stroj vadu, môžete ho reklamovať podľa reklamačného poriadku.`,
};

export async function withdrawalStep(_prev: WithdrawalFormState, form: FormData): Promise<WithdrawalFormState> {
  const raw = {
    name: String(form.get("name") ?? ""),
    orderNumber: String(form.get("orderNumber") ?? ""),
    email: String(form.get("email") ?? ""),
    reason: String(form.get("reason") ?? ""),
  };
  const intent = form.get("intent");
  if (intent === "back") return { step: "identify", values: raw };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { step: "identify", values: raw, errors, message: "Skontrolujte zvýraznené polia." };
  }
  const values = parsed.data;
  const identify = (message: string): WithdrawalFormState => ({ step: "identify", values, message });

  const db = createAdminClient();
  const order = await findOrderForWithdrawal(db, values.orderNumber, values.email);
  if (!order) return identify(NOT_FOUND);
  values.orderNumber = order.orderNumber;

  const eligibility = withdrawalEligibility({
    customer_type: order.customerType,
    status: order.status,
    delivered_at: order.deliveredAt,
    withdrawal_deadline: order.withdrawalDeadline,
    contract_place: order.contractPlace,
  });
  if (!eligibility.allowed) return identify(BLOCKED[eligibility.block!](eligibility.deadline?.toISOString() ?? null));

  const open = remainingLines(order.lines, order.returns);
  if (open.length === 0) {
    return identify(
      "Od tejto objednávky ste už odstúpili. Potvrdenie nájdete na odkaze, ktorý sa zobrazil po odoslaní, a stav vo vašom účte alebo na stránke objednávky.",
    );
  }
  const earlierWithdrawal = order.returns.some((r) => r.status !== "rejected");
  const settings = await getShopSettings();
  const review: WithdrawalReview = {
    orderNumber: order.orderNumber,
    orderedAt: order.createdAt,
    deliveredAt: order.deliveredAt,
    deadline: order.deliveredAt ? (eligibility.deadline?.toISOString() ?? null) : null,
    daysLeft: eligibility.daysLeft,
    lines: open,
    earlierWithdrawal,
    seller: sellerOf(settings),
  };
  if (intent !== "confirm") return { step: "review", values, review };

  const picked = new Set(form.getAll("item").map(String));
  const selected = open.filter((l) => picked.has(l.id));
  if (selected.length === 0) {
    return { step: "review", values, review, errors: { item: "Vyberte aspoň jeden tovar, od ktorého odstupujete." } };
  }

  const items = toReturnItems(selected, order.lines, earlierWithdrawal);
  const submittedAt = new Date().toISOString();
  const customer = await getCustomer();
  const channel = customer && customer.id === order.profileId ? "portal" : "public_form";
  const noticeText = withdrawalNotice({
    seller: review.seller,
    orderNumber: order.orderNumber,
    orderedAt: order.createdAt,
    deliveredAt: order.deliveredAt,
    lines: selected,
    wholeOrder: items == null,
    name: values.name,
    email: values.email,
    reason: values.reason || null,
    submittedAt,
    channel,
  });
  const h = await headers();
  const result = await createReturn(db, {
    orderId: order.id,
    name: values.name,
    email: values.email,
    items,
    reason: values.reason || null,
    channel,
    noticeText,
    submittedAt,
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip"),
    userAgent: h.get("user-agent")?.slice(0, 400) ?? null,
  });
  if (!result.ok) {
    return identify(
      result.reason === "already_withdrawn"
        ? "Od tohto tovaru ste už odstúpili (možno ste formulár odoslali dvakrát). Stav nájdete na stránke objednávky."
        : "Odstúpenie sa nepodarilo uložiť. Skúste to znova alebo nám ho pošlite e-mailom.",
    );
  }
  redirect(`/odstupenie-od-zmluvy/potvrdenie/${encodeURIComponent(result.returnNumber)}?t=${result.accessToken}`);
}
