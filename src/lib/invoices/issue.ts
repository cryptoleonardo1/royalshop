import "server-only";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  bratislavaIsoDay,
  buildCreditNoteDraft,
  buildInvoiceDraft,
  type CustomerSnapshot,
  type DraftLine,
  type InvoicePaymentMethod,
  type SupplierSnapshot,
} from "./build";
import { renderInvoicePdf, type PdfInvoice } from "./pdf";

// Issuing invoices and credit notes. Callers authorize (requireAdmin) and pass the service-role client.
// The number is assigned only by issue_invoice() in the DB; the PDF is rendered right after and stored in
// the private `documents` bucket. A failed PDF leaves an issued invoice without pdf_path; ensureInvoicePdf
// (admin button) renders it again from the frozen snapshots.

const SHIPPING_LABEL: Record<string, string> = {
  courier: "Doprava kuriérom",
  own_transport: "Doprava vlastným rozvozom",
  pickup_senec: "Osobný odber",
};

const CHARGED = ["captured", "partially_refunded", "refunded"];

export type IssueResult = { ok: true; number: string; pdf: boolean; message?: string } | { ok: false; message: string };

async function supplierSnapshot(db: SupabaseClient): Promise<SupplierSnapshot> {
  const { data, error } = await db
    .from("company_settings")
    .select("company_name, street, city, zip, ico, dic, ic_dph, register_info, iban, swift, email, phone, web")
    .eq("id", 1)
    .single();
  if (error) throw new Error(`company_settings: ${error.message}`);
  const { company_name, ...rest } = data;
  return { name: company_name, ...rest };
}

// Bratislava "today" for the issue date (the DB runs in UTC).
const today = () => bratislavaIsoDay(new Date());

async function insertAndIssue(
  db: SupabaseClient,
  row: Record<string, unknown>,
  lines: DraftLine[],
): Promise<{ id: string; number: string } | string> {
  const { data: draft, error } = await db.from("invoices").insert(row).select("id").single();
  if (error) {
    return error.code === "23505" ? "K objednávke už faktúra existuje." : `Faktúru sa nepodarilo založiť: ${error.message}`;
  }
  const discard = async () => {
    await db.from("invoices").delete().eq("id", draft.id).eq("status", "draft");
  };
  const ins = await db.from("invoice_lines").insert(lines.map((l) => ({ ...l, invoice_id: draft.id })));
  if (ins.error) {
    await discard();
    return `Riadky faktúry sa nepodarilo uložiť: ${ins.error.message}`;
  }
  const { data: number, error: issueErr } = await db.rpc("issue_invoice", { p_invoice_id: draft.id, p_issue_date: today() });
  if (issueErr) {
    await discard();
    return `Faktúru sa nepodarilo vystaviť: ${issueErr.message}`;
  }
  return { id: draft.id, number: number as string };
}

// Invoice for a fully paid order (one per order). Re-running it returns the existing invoice and only
// fills in a missing PDF.
export async function issueOrderInvoice(db: SupabaseClient, orderId: string): Promise<IssueResult> {
  const { data: existing } = await db
    .from("invoices")
    .select("id, invoice_number, status, pdf_path")
    .eq("order_id", orderId)
    .eq("type", "invoice")
    .neq("status", "cancelled")
    .maybeSingle();
  if (existing?.status === "issued") {
    const pdf = existing.pdf_path ? true : await ensureInvoicePdf(db, existing.id);
    return { ok: true, number: existing.invoice_number, pdf: pdf === true, message: typeof pdf === "string" ? pdf : undefined };
  }
  if (existing) await db.from("invoices").delete().eq("id", existing.id).eq("status", "draft");

  const { data: o, error } = await db
    .from("orders")
    .select(
      `id, order_number, profile_id, customer_type, email, phone, billing, company, shipping_method, shipping_price_cents,
       total_gross_cents, payment_status,
       items:order_items(name, sku, quantity, unit_price_gross_cents, vat_rate),
       payments(provider, status, amount_cents, captured_at)`,
    )
    .eq("id", orderId)
    .single();
  if (error) return { ok: false, message: `Objednávku sa nepodarilo načítať: ${error.message}` };

  const charged = (o.payments ?? [])
    .filter((p) => CHARGED.includes(p.status) && p.captured_at)
    .sort((a, b) => a.captured_at!.localeCompare(b.captured_at!));
  const paidCents = charged.reduce((s, p) => s + p.amount_cents, 0);
  if (!charged.length || paidCents < o.total_gross_cents) {
    return { ok: false, message: "Faktúra sa vystavuje až po úplnej platbe." };
  }

  let draft;
  try {
    draft = buildInvoiceDraft(
      {
        orderNumber: o.order_number,
        customerType: o.customer_type,
        email: o.email,
        phone: o.phone,
        billing: o.billing,
        company: o.company,
        items: (o.items ?? []).map((i) => ({
          name: i.name,
          sku: i.sku,
          quantity: i.quantity,
          unitPriceGrossCents: i.unit_price_gross_cents,
          vatRate: Number(i.vat_rate),
        })),
        shippingPriceCents: o.shipping_price_cents,
        shippingLabel: SHIPPING_LABEL[o.shipping_method] ?? "Doprava",
        totalGrossCents: o.total_gross_cents,
        payment: { provider: charged[0].provider, capturedAt: charged[0].captured_at! },
      },
      today(),
    );
  } catch (err) {
    return { ok: false, message: `Faktúru nemožno zostaviť: ${(err as Error).message}` };
  }

  const issued = await insertAndIssue(
    db,
    { ...draft.invoice, order_id: o.id, profile_id: o.profile_id, supplier_snapshot: await supplierSnapshot(db) },
    draft.lines,
  );
  if (typeof issued === "string") return { ok: false, message: issued };
  const pdf = await ensureInvoicePdf(db, issued.id);
  return { ok: true, number: issued.number, pdf: pdf === true, message: typeof pdf === "string" ? pdf : undefined };
}

// Credit note for money returned on an order (cancel, withdrawal). No issued invoice → nothing to correct.
export async function issueCreditNote(
  db: SupabaseClient,
  orderId: string,
  refundCents: number,
  reason: string,
): Promise<IssueResult | null> {
  if (refundCents <= 0) return null;
  const { data: inv, error } = await db
    .from("invoices")
    .select(
      `id, invoice_number, profile_id, total_gross_cents, payment_method, customer_snapshot, supplier_snapshot,
       lines:invoice_lines(position, code, description, quantity, unit, unit_price_net_cents, vat_rate, line_net_cents, line_vat_cents, line_gross_cents)`,
    )
    .eq("order_id", orderId)
    .eq("type", "invoice")
    .eq("status", "issued")
    .maybeSingle();
  if (error) return { ok: false, message: `Faktúru sa nepodarilo načítať: ${error.message}` };
  if (!inv) return null;

  const { data: notes } = await db
    .from("invoices")
    .select("total_gross_cents")
    .eq("corrects_invoice_id", inv.id)
    .eq("status", "issued");
  const left = inv.total_gross_cents + (notes ?? []).reduce((s, n) => s + n.total_gross_cents, 0);
  if (refundCents > left) {
    return { ok: false, message: `Dobropis na ${(refundCents / 100).toFixed(2)} € presahuje zostatok faktúry ${inv.invoice_number}.` };
  }

  const lines = [...(inv.lines ?? [])].sort((a, b) => a.position - b.position).map((l) => ({ ...l, quantity: Number(l.quantity), vat_rate: Number(l.vat_rate) }));
  const draft = buildCreditNoteDraft(
    {
      invoiceNumber: inv.invoice_number,
      totalGrossCents: inv.total_gross_cents,
      lines,
      customerSnapshot: inv.customer_snapshot as CustomerSnapshot,
      paymentMethod: inv.payment_method as InvoicePaymentMethod,
    },
    refundCents,
    reason,
    new Date().toISOString(),
  );
  const issued = await insertAndIssue(
    db,
    {
      ...draft.invoice,
      order_id: orderId,
      corrects_invoice_id: inv.id,
      profile_id: inv.profile_id,
      // the supplier as printed on the invoice being corrected
      supplier_snapshot: inv.supplier_snapshot,
    },
    draft.lines,
  );
  if (typeof issued === "string") return { ok: false, message: issued };
  const pdf = await ensureInvoicePdf(db, issued.id);
  return { ok: true, number: issued.number, pdf: pdf === true, message: typeof pdf === "string" ? pdf : undefined };
}

// Renders and stores the PDF of an issued document. true, or the reason it failed.
export async function ensureInvoicePdf(db: SupabaseClient, invoiceId: string): Promise<true | string> {
  try {
    const { data: inv, error } = await db
      .from("invoices")
      .select(
        `*, order:orders(order_number), corrects:corrects_invoice_id(invoice_number),
         lines:invoice_lines(position, code, description, quantity, unit, unit_price_net_cents, vat_rate, line_net_cents, line_vat_cents, line_gross_cents)`,
      )
      .eq("id", invoiceId)
      .single();
    if (error) return `PDF: doklad sa nepodarilo načítať: ${error.message}`;
    if (inv.status === "draft") return "PDF sa robí len pre vystavený doklad.";
    if (inv.pdf_path) return true;

    const pdfInvoice: PdfInvoice = {
      type: inv.type,
      invoice_number: inv.invoice_number,
      order_number: inv.order?.order_number ?? null,
      corrects_number: inv.corrects?.invoice_number ?? null,
      issue_date: inv.issue_date,
      tax_point_date: inv.tax_point_date,
      due_date: inv.due_date,
      variable_symbol: inv.variable_symbol,
      payment_method: inv.payment_method,
      header_text: inv.header_text,
      note: inv.note,
      total_net_cents: inv.total_net_cents,
      total_vat_cents: inv.total_vat_cents,
      total_gross_cents: inv.total_gross_cents,
      vat_recap: inv.vat_recap,
    };
    const lines = [...(inv.lines ?? [])]
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((l: Record<string, unknown>) => ({ ...l, quantity: Number(l.quantity), vat_rate: Number(l.vat_rate) }));
    const bytes = await renderInvoicePdf({
      invoice: pdfInvoice,
      lines: lines as never,
      supplier: inv.supplier_snapshot,
      customer: inv.customer_snapshot,
    });

    const folder = inv.type === "credit_note" ? "credit-notes" : "invoices";
    const path = `${folder}/${inv.issue_date.slice(0, 4)}/${inv.invoice_number}.pdf`;
    const up = await db.storage.from("documents").upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (up.error) return `PDF sa nepodarilo uložiť: ${up.error.message}`;
    const sha = createHash("sha256").update(bytes).digest("hex");
    const upd = await db.from("invoices").update({ pdf_path: path, pdf_sha256: sha }).eq("id", inv.id);
    if (upd.error) return `PDF je uložené, no doklad sa nepodarilo doplniť: ${upd.error.message}`;
    return true;
  } catch (err) {
    return `PDF sa nepodarilo vytvoriť: ${(err as Error).message}`;
  }
}

// Short-lived download link for a stored PDF.
export async function invoicePdfUrl(db: SupabaseClient, pdfPath: string, filename: string): Promise<string | null> {
  const { data } = await db.storage.from("documents").createSignedUrl(pdfPath, 60, { download: filename });
  return data?.signedUrl ?? null;
}
