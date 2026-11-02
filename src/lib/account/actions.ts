"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";
import type { FieldErrors } from "@/lib/checkout-schema";
import { getCustomer, requireCustomer, safeNext } from "./auth";
import { formatZip, parseForm, passwordSchema, profileSchema, registerSchema } from "./schema";

// Customer account actions. Writes run with the service role after requireCustomer(), always scoped to the
// signed-in customer's own id.

export type FormState =
  | { errors?: FieldErrors; message?: string; ok?: string; values?: Record<string, string> }
  | undefined;

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { message: "Zadajte e-mail a heslo.", values: { email } };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { message: "Nesprávny e-mail alebo heslo.", values: { email } };
  redirect(safeNext(form.get("next")));
}

// Until shop@royalstroje.sk is wired to Resend, Supabase cannot e-mail customers, so the account is created
// already confirmed. Nothing is linked by e-mail alone: orders join an account only at checkout while signed
// in, or with the order's secret link (claimOrder). Switch to supabase.auth.signUp with e-mail confirmation
// once Resend is live.
export async function register(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = parseForm(registerSchema, form);
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values, message: "Skontrolujte zvýraznené polia." };
  const v = parsed.data;
  const { error } = await createAdminClient().auth.admin.createUser({
    email: v.email,
    password: v.password,
    email_confirm: true,
    user_metadata: { first_name: v.firstName, last_name: v.lastName },
  });
  if (error) {
    const exists = error.code === "email_exists" || /already/i.test(error.message);
    return {
      values: { firstName: v.firstName, lastName: v.lastName, email: v.email },
      message: exists ? "Účet s týmto e-mailom už existuje. Prihláste sa." : "Účet sa nepodarilo vytvoriť. Skúste to znova.",
    };
  }
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
  redirect(safeNext(form.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const customer = await requireCustomer();
  const parsed = parseForm(profileSchema, form);
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values, message: "Skontrolujte zvýraznené polia." };
  const v = parsed.data;
  const company = v.customerType === "company";
  const db = createAdminClient();

  const { error } = await db
    .from("profiles")
    .update({
      customer_type: v.customerType,
      first_name: v.firstName,
      last_name: v.lastName,
      phone: v.phone ?? null,
      company_name: company ? v.companyName : null,
      ico: company ? v.ico!.replace(/\s+/g, "") : null,
      dic: company ? v.dic!.replace(/\s+/g, "") : null,
      ic_dph: company && v.icDph ? v.icDph.replace(/\s+/g, "").toUpperCase() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customer.id);
  if (error) throw new Error(`Profile update failed: ${error.message}`);

  const { data: existing } = await db
    .from("addresses")
    .select("id")
    .eq("profile_id", customer.id)
    .eq("type", "billing")
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (v.street && v.city && v.zip) {
    const address = {
      name: company ? v.companyName! : `${v.firstName} ${v.lastName}`,
      street: v.street,
      city: v.city,
      zip: formatZip(v.zip),
      phone: v.phone ?? null,
      is_default: true,
      updated_at: new Date().toISOString(),
    };
    const write = existing
      ? await db.from("addresses").update(address).eq("id", existing.id).eq("profile_id", customer.id)
      : await db.from("addresses").insert({ ...address, profile_id: customer.id, type: "billing" });
    if (write.error) throw new Error(`Address save failed: ${write.error.message}`);
  } else if (existing) {
    await db.from("addresses").delete().eq("id", existing.id).eq("profile_id", customer.id);
  }
  // React resets the form after the action: send the saved values back so the fields keep them
  const values: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") values[key] = value;
  });
  return { ok: "Údaje sme uložili. Pri ďalšom nákupe ich predvyplníme v pokladni.", values };
}

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const customer = await requireCustomer();
  const parsed = parseForm(passwordSchema, form);
  if (!parsed.ok) return { errors: parsed.errors };
  // check the current password on a throwaway client so the browser session is untouched
  const check = await createPublicClient().auth.signInWithPassword({
    email: customer.email,
    password: parsed.data.currentPassword,
  });
  if (check.error) return { errors: { currentPassword: "Súčasné heslo nie je správne" } };
  const { error } = await createAdminClient().auth.admin.updateUserById(customer.id, {
    password: parsed.data.password,
  });
  if (error) return { message: "Heslo sa nepodarilo zmeniť. Skúste to znova." };
  return { ok: "Heslo sme zmenili." };
}

// GDPR erasure of the account. Orders and invoices stay (accounting duty), only unlinked from the profile
// (orders.profile_id is "on delete set null").
export async function deleteAccount(_prev: FormState, form: FormData): Promise<FormState> {
  const customer = await requireCustomer();
  if (form.get("confirm") !== "on") return { errors: { confirm: "Potvrďte zrušenie účtu" } };
  const { error } = await createAdminClient().auth.admin.deleteUser(customer.id);
  if (error) return { message: "Účet sa nepodarilo zrušiť. Napíšte nám, zrušíme ho ručne." };
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// "Uložiť do môjho účtu" on a guest order page: the secret link proves the order is the customer's.
export async function claimOrder(form: FormData): Promise<void> {
  const number = String(form.get("number") ?? "");
  const token = String(form.get("token") ?? "");
  const customer = await getCustomer();
  if (!customer) redirect(`/ucet/prihlasenie?next=${encodeURIComponent(`/objednavka/${number}?t=${token}`)}`);
  if (!/^[0-9a-f-]{36}$/i.test(token)) redirect("/ucet");
  const { error } = await createAdminClient()
    .from("orders")
    .update({ profile_id: customer.id })
    .eq("order_number", number)
    .eq("access_token", token)
    .is("profile_id", null);
  if (error) throw new Error(`Order claim failed: ${error.message}`);
  redirect(`/ucet/objednavky/${encodeURIComponent(number)}`);
}
