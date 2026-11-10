import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { invoicePdfUrl } from "@/lib/invoices/issue";

// The customer's invoice / credit note PDF. Same access as the order page: order number + its access token
// (the e-mail link and the account portal both carry it). Answers 404 for anything that does not match.
export async function GET(req: NextRequest, ctx: RouteContext<"/objednavka/[cislo]/doklad/[id]">) {
  const { cislo, id } = await ctx.params;
  const token = req.nextUrl.searchParams.get("t") ?? "";
  const uuid = /^[0-9a-f-]{36}$/i;
  const missing = () => new NextResponse("Doklad sa nenašiel.", { status: 404 });
  if (!uuid.test(id) || !uuid.test(token)) return missing();

  const db = createAdminClient();
  const { data: order } = await db
    .from("orders")
    .select("id")
    .eq("order_number", decodeURIComponent(cislo))
    .eq("access_token", token)
    .maybeSingle();
  if (!order) return missing();
  const { data: inv } = await db
    .from("invoices")
    .select("invoice_number, type, pdf_path")
    .eq("id", id)
    .eq("order_id", order.id)
    .neq("status", "draft")
    .maybeSingle();
  if (!inv?.pdf_path) return missing();

  const name = `${inv.type === "credit_note" ? "dobropis" : "faktura"}-${inv.invoice_number}.pdf`;
  const url = await invoicePdfUrl(db, inv.pdf_path, name);
  if (!url) return new NextResponse("PDF sa nepodarilo otvoriť.", { status: 502 });
  return NextResponse.redirect(url);
}
