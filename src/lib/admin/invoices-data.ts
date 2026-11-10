import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";

// Issued invoices and credit notes of one month (by issue date) for the list and the accountant.

export interface InvoiceRow {
  id: string;
  number: string;
  creditNote: boolean;
  cancelled: boolean;
  issueDate: string;
  taxPointDate: string;
  customer: string;
  ico: string | null;
  orderNumber: string | null;
  paymentMethod: string;
  netCents: number;
  vatCents: number;
  grossCents: number;
  hasPdf: boolean;
}

export async function listInvoices(month: string): Promise<InvoiceRow[]> {
  await requireAdmin();
  const [y, m] = month.split("-").map(Number);
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const to = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const db = await createClient();
  const { data, error } = await db
    .from("invoices")
    .select(
      "id, invoice_number, type, status, issue_date, tax_point_date, payment_method, customer_snapshot, total_net_cents, total_vat_cents, total_gross_cents, pdf_path, order:orders(order_number)",
    )
    .neq("status", "draft")
    .gte("issue_date", from)
    .lt("issue_date", to)
    .order("issue_date")
    .order("invoice_number");
  if (error) throw new Error(`Invoices ${month}: ${error.message}`);
  return (data ?? []).map((r) => {
    const c = r.customer_snapshot as { name?: string; ico?: string | null } | null;
    const order = r.order as unknown as { order_number: string } | null;
    return {
      id: r.id,
      number: r.invoice_number,
      creditNote: r.type === "credit_note",
      cancelled: r.status === "cancelled",
      issueDate: r.issue_date,
      taxPointDate: r.tax_point_date,
      customer: c?.name ?? "–",
      ico: c?.ico ?? null,
      orderNumber: order?.order_number ?? null,
      paymentMethod: r.payment_method,
      netCents: r.total_net_cents,
      vatCents: r.total_vat_cents,
      grossCents: r.total_gross_cents,
      hasPdf: Boolean(r.pdf_path),
    };
  });
}
