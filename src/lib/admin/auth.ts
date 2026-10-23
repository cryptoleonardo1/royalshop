import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Admin data access layer: every admin page and server action calls requireAdmin() itself (proxy.ts only
// refreshes the session). The role lives in profiles.role, never in user_metadata.

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export async function getAdmin(): Promise<AdminUser | null> {
  await connection(); // request time only: the auth client reads the clock (token expiry)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return null;
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return { id: user.id, email: user.email ?? "", name: name || (user.email ?? "") };
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/prihlasenie");
  return admin;
}
