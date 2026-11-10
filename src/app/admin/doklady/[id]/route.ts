import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { invoicePdfUrl } from "@/lib/invoices/issue";

// Invoice / credit note PDF for the admin: a 60-second signed link to the private `documents` bucket.
export async function GET(_req: Request, ctx: RouteContext<"/admin/doklady/[id]">) {
  await requireAdmin();
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Nenájdené", { status: 404 });
  const db = createAdminClient();
  const { data: inv } = await db.from("invoices").select("invoice_number, type, pdf_path").eq("id", id).maybeSingle();
  if (!inv?.pdf_path) return new NextResponse("Doklad nemá PDF.", { status: 404 });
  const name = `${inv.type === "credit_note" ? "dobropis" : "faktura"}-${inv.invoice_number}.pdf`;
  const url = await invoicePdfUrl(db, inv.pdf_path, name);
  if (!url) return new NextResponse("PDF sa nepodarilo otvoriť.", { status: 502 });
  return NextResponse.redirect(url);
}
