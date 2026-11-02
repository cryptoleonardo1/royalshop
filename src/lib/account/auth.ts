import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Customer portal access: every /ucet page and account action calls getCustomer()/requireCustomer()
// itself (proxy.ts only refreshes the session). Data is then read with the service role, always filtered
// by the customer's own id (see src/lib/account/data.ts).

export interface Customer {
  id: string;
  email: string;
}

export async function getCustomer(): Promise<Customer | null> {
  await connection(); // request time only: the auth client reads the clock (token expiry)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
}

export async function requireCustomer(next?: string): Promise<Customer> {
  const customer = await getCustomer();
  if (!customer) redirect(next ? `/ucet/prihlasenie?next=${encodeURIComponent(next)}` : "/ucet/prihlasenie");
  return customer;
}

// Only same-site paths are allowed after login.
export function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/ucet";
}
