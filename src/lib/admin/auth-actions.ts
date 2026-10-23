"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdmin } from "./auth";

export type SignInState = { message?: string; email?: string } | undefined;

export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { message: "Zadajte e-mail a heslo.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { message: "Nesprávny e-mail alebo heslo.", email };

  if (!(await getAdmin())) {
    await supabase.auth.signOut();
    return { message: "Tento účet nemá prístup do administrácie.", email };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/prihlasenie");
}
