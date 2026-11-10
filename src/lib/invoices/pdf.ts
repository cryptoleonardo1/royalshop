import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CustomerSnapshot, InvoicePaymentMethod, SupplierSnapshot } from "./build";

// Invoice / credit note PDF, ported from crm_core's generateInvoicePdf (block order the accountant knows:
// supplier | number; payment | dates; header sentence; lines; per-rate recap; footer). Server-side, and
// without PAY by square: every shop invoice is issued after the full payment, so a QR code would only
// invite paying twice. Prints only the snapshots it is given, so a reprint is the same document.
// Fonts: next.config.ts traces src/lib/invoices/fonts into the admin functions.

export interface PdfInvoice {
  type: "invoice" | "credit_note";
  invoice_number: string;
  order_number: string | null;
  corrects_number: string | null;
  issue_date: string;
  tax_point_date: string;
  due_date: string;
  variable_symbol: string;
  payment_method: InvoicePaymentMethod;
  header_text: string | null;
  note: string | null;
  total_net_cents: number;
  total_vat_cents: number;
  total_gross_cents: number;
  vat_recap: { vat_rate: number; net_cents: number; vat_cents: number; gross_cents: number }[];
}

export interface PdfLine {
  code: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price_net_cents: number;
  vat_rate: number;
  line_net_cents: number;
  line_vat_cents: number;
  line_gross_cents: number;
}

// Full literal paths, as in the Next docs (opengraph-image fonts), so the file tracer can resolve them.
let fonts: Promise<{ regular: string; bold: string }> | null = null;
function loadFonts() {
  fonts ??= Promise.all([
    readFile(path.join(process.cwd(), "src/lib/invoices/fonts/Inter-Regular.ttf")),
    readFile(path.join(process.cwd(), "src/lib/invoices/fonts/Inter-Bold.ttf")),
  ]).then(([r, b]) => ({ regular: r.toString("base64"), bold: b.toString("base64") }));
  return fonts;
}

// ISO 13616 mod-97 check (from crm_core payBySquare.js).
export function isValidIban(iban: string): boolean {
  const v = iban.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(v)) return false;
  let rem = 0;
  for (const ch of v.slice(4) + v.slice(0, 4)) {
    const n = ch >= "A" ? ch.charCodeAt(0) - 55 : Number(ch);
    rem = (rem * (n > 9 ? 100 : 10) + n) % 97;
  }
  return rem === 1;
}

const F = "Inter";
const INK: [number, number, number] = [22, 22, 20];
const MUTED: [number, number, number] = [110, 110, 104];
const RULE: [number, number, number] = [210, 210, 204];
const BAND: [number, number, number] = [244, 244, 239];
const ACCENT: [number, number, number] = [224, 82, 0];
const tint = (rgb: number[], t: number) => rgb.map((c) => Math.round(c + (255 - c) * t)) as [number, number, number];

const money = (cents: number) =>
  (cents / 100).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const qty = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace(".", ","));
const rate = (v: number) => String(Number(v)).replace(".", ",");
const date = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "";
};

const TITLE = { invoice: "FAKTÚRA", credit_note: "DOBROPIS" };
const SUBTITLE = { invoice: "Daňový doklad", credit_note: "Opravný doklad (§ 71 ods. 2 zákona o DPH)" };
const METHOD = { karta: "Platobná karta", prevod: "Bankový prevod", hotovost: "Hotovosť" };

export async function renderInvoicePdf(p: {
  invoice: PdfInvoice;
  lines: PdfLine[];
  supplier: SupplierSnapshot;
  customer: CustomerSnapshot;
}): Promise<Uint8Array> {
  const { invoice: inv, lines, supplier: s, customer: c } = p;
  const credit = inv.type === "credit_note";
  const { regular, bold } = await loadFonts();
  const doc = new jsPDF("p", "mm", "a4");
  doc.addFileToVFS("Inter-Regular.ttf", regular);
  doc.addFont("Inter-Regular.ttf", F, "normal", "Identity-H");
  doc.addFileToVFS("Inter-Bold.ttf", bold);
  doc.addFont("Inter-Bold.ttf", F, "bold", "Identity-H");
  doc.setFont(F);

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const CW = W - 2 * M;
  const text = (str: string | string[], x: number, y: number, opts: Record<string, unknown> = {}) => doc.text(str, x, y, opts);
  const style = (size: number, weight: "normal" | "bold" = "normal", color = INK) => {
    doc.setFont(F, weight);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const rule = (x1: number, y1: number, x2: number, y2: number, color = RULE, width = 0.25) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
  };
  const label = (str: string, x: number, y: number) => {
    style(6.8, "bold", ACCENT);
    text(str.toUpperCase(), x, y, { charSpace: 0.5 });
  };
  const kv = (k: string, v: string, x: number, y: number, { strong = false, labelW = 34 } = {}) => {
    style(8.5, "normal", MUTED);
    text(k, x, y);
    style(8.5, strong ? "bold" : "normal");
    text(v, x + labelW, y);
  };

  // ═══ LETTERHEAD | TITLE ═══
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, W, 2.2, "F");
  let y = 17;
  style(11, "bold");
  text(s.name, M, y + 1);
  style(7.5, "normal", MUTED);
  text([s.web, s.email, s.phone].filter(Boolean).join("   ·   "), M, y + 5.5);

  style(20, "bold", ACCENT);
  text(TITLE[inv.type], W - M, y + 4, { align: "right" });
  style(14, "bold");
  text(inv.invoice_number, W - M, y + 11.5, { align: "right" });
  let ty = y + 16.5;
  const ref = (k: string, v: string | null) => {
    if (!v) return;
    style(8.5, "bold");
    text(v, W - M, ty, { align: "right" });
    const vw = doc.getTextWidth(v);
    style(8.5, "normal", MUTED);
    text(k, W - M - vw - 2.5, ty, { align: "right" });
    ty += 4.6;
  };
  ref("K faktúre č.", inv.corrects_number);
  ref("Objednávka č.", inv.order_number);
  style(7.5, "normal", MUTED);
  text(SUBTITLE[inv.type], W - M, ty, { align: "right" });
  y = ty + 9;

  // ═══ PARTIES ═══
  const colR = M + CW / 2 + 4;
  const colW = CW / 2 - 6;
  const party = (x: number, top: number, name: string, address: string[], ids: [string, string][], note: string) => {
    let py = top;
    style(10, "bold");
    text(doc.splitTextToSize(name, colW), x, py);
    py += 5.2;
    style(9);
    for (const l of address) {
      text(l, x, py);
      py += 4.3;
    }
    if (ids.length) py += 1.2;
    for (const [k, v] of ids) {
      kv(k, v, x, py, { labelW: 14 });
      py += 4.3;
    }
    if (note) {
      style(7.2, "normal", MUTED);
      const wrapped = doc.splitTextToSize(note, colW);
      text(wrapped, x, py + 0.8);
      py += wrapped.length * 3.3 + 0.8;
    }
    return py;
  };
  label("Dodávateľ", M, y);
  label("Odberateľ", colR, y);
  rule(M, y + 1.6, M + 12, y + 1.6, ACCENT, 0.6);
  rule(colR, y + 1.6, colR + 12, y + 1.6, ACCENT, 0.6);
  y += 7;
  const ids = (o: { ico: string | null; dic: string | null; ic_dph: string | null }) =>
    ([["IČO", o.ico], ["DIČ", o.dic], ["IČ DPH", o.ic_dph]] as [string, string | null][]).filter(
      (r): r is [string, string] => Boolean(r[1]),
    );
  const sy = party(
    M,
    y,
    s.name,
    [s.street, [s.zip, s.city].filter(Boolean).join(" "), "Slovenská republika"].filter(Boolean) as string[],
    ids(s),
    s.register_info ? `Zapísaná v ${s.register_info.replace(/^Zapísaná v /i, "")}` : "",
  );
  const cy = party(
    colR,
    y,
    c.name,
    [c.contact ? `k rukám: ${c.contact}` : "", c.street, `${c.zip} ${c.city}`, "Slovenská republika"].filter(Boolean),
    ids(c),
    [c.email, c.phone].filter(Boolean).join(", "),
  );
  y = Math.max(sy, cy) + 5;

  // ═══ PAYMENT | DATES | PAID (one band) ═══
  const rowH = 4.8;
  const bandH = 7 + 4 * rowH + 6;
  doc.setFillColor(...BAND);
  doc.roundedRect(M, y, CW, bandH, 2, 2, "F");
  const bx = M + 5;
  const dx = M + CW * 0.6;
  let by = y + 7;
  label("Platobné údaje", bx, by);
  label("Dátumy", dx, by);
  by += 5.5;
  const pay: [string, string, boolean?][] = [
    ["Forma úhrady", METHOD[inv.payment_method]],
    ["Variabilný symbol", inv.variable_symbol, true],
  ];
  // a placeholder account (settings not filled in yet) must never reach a tax document
  if (s.iban && isValidIban(s.iban)) {
    pay.push(["IBAN", s.iban], ["SWIFT / BIC", s.swift ?? ""]);
  }
  pay.forEach(([k, v, strong], i) => kv(k, v, bx, by + i * rowH, { strong, labelW: 32 }));
  const dates: [string, string][] = [
    ["Dátum vyhotovenia", date(inv.issue_date)],
    [credit ? "Dátum vrátenia platby" : "Dátum prijatia platby", date(inv.tax_point_date)],
    ["Dátum splatnosti", date(inv.due_date)],
  ];
  dates.forEach(([k, v], i) => kv(k, v, dx, by + i * rowH, { labelW: 36 }));
  const ay = by + 3 * rowH + 1;
  label(credit ? "Vrátená suma" : "K úhrade", dx, ay);
  style(12, "bold", credit ? INK : ACCENT);
  text(credit ? `${money(-inv.total_gross_cents)} EUR` : "0,00 EUR", dx + 36, ay + 0.3);
  if (!credit) {
    const vw = doc.getTextWidth("0,00 EUR");
    style(8, "normal", MUTED);
    text("uhradené", dx + 36 + vw + 2, ay + 0.3);
  }
  y += bandH + 8;

  // ═══ HEADER SENTENCE ═══
  if (inv.header_text) {
    style(9.5);
    const ht = doc.splitTextToSize(inv.header_text, CW);
    text(ht, M, y);
    y += ht.length * 4.4 + 3;
  }

  // ═══ LINES ═══
  const head = [["Č.", "Kód", "Popis", "Množ.", "MJ", "Cena za MJ\nbez DPH", "DPH\n%", "Spolu\nbez DPH", "DPH", "Celková\ncena"]];
  const body = lines.map((l, i) => [
    String(i + 1),
    l.code ?? "",
    l.description,
    qty(l.quantity),
    l.unit,
    money(l.unit_price_net_cents),
    rate(l.vat_rate),
    money(l.line_net_cents),
    money(l.line_vat_cents),
    money(l.line_gross_cents),
  ]);
  const right = { halign: "right" as const };
  const CONT_TOP = 27;
  style(7.5);
  const codeW = Math.min(24, Math.max(10, ...lines.map((l) => doc.getTextWidth(l.code ?? "")))) + 3.4;
  const columnStyles = {
    0: { cellWidth: 6 },
    1: { cellWidth: codeW },
    2: { cellWidth: "auto" as const },
    3: { cellWidth: 10, ...right },
    4: { cellWidth: 8 },
    5: { cellWidth: 19, ...right },
    6: { cellWidth: 9, ...right },
    7: { cellWidth: 19, ...right },
    8: { cellWidth: 16, ...right },
    9: { cellWidth: 20, ...right },
  };
  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: "plain",
    styles: {
      font: F,
      fontSize: 7.5,
      textColor: INK,
      cellPadding: { top: 2, bottom: 2, left: 1.2, right: 1.2 },
      lineColor: RULE,
      lineWidth: 0,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: { fillColor: tint(ACCENT, 0.86), textColor: INK, fontStyle: "bold", fontSize: 6.8, valign: "bottom", lineWidth: { bottom: 0.4 }, lineColor: ACCENT },
    bodyStyles: { lineWidth: { bottom: 0.15 } },
    columnStyles,
    margin: { left: M, right: M, bottom: 28, top: CONT_TOP },
    rowPageBreak: "avoid",
    showHead: "everyPage",
    didParseCell: (d) => {
      if (d.section === "head" && (columnStyles as Record<number, { halign?: string }>)[d.column.index]?.halign) {
        d.cell.styles.halign = "right";
      }
    },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;

  // ═══ NOTE (left) | RECAP (right) ═══
  const RW = 84;
  const recapH = inv.vat_recap.length * 2 * 4.8 + 4.8 + 14;
  if (y + recapH + 40 > H - 22) {
    doc.addPage();
    y = CONT_TOP;
  }
  const LX = W - M - RW;
  if (inv.note) {
    style(8.5);
    text(doc.splitTextToSize(inv.note, CW - RW - 10), M, y + 1);
  }
  let ry = y + 1;
  const recapRow = (k: string, v: string) => {
    style(8.5);
    text(k, LX, ry);
    text(v, W - M, ry, { align: "right" });
    ry += 4.8;
  };
  for (const r of inv.vat_recap) {
    recapRow(`Základ dane ${rate(r.vat_rate)} %`, money(r.net_cents));
    recapRow(`DPH ${rate(r.vat_rate)} %`, money(r.vat_cents));
  }
  recapRow("Celková suma s DPH", money(inv.total_gross_cents));
  ry += 1;
  doc.setFillColor(...tint(ACCENT, 0.92));
  doc.roundedRect(LX - 4, ry - 4.5, RW + 4, 11.5, 1.5, 1.5, "F");
  style(9.5, "bold");
  text(credit ? "Spolu na dobropise" : "Celková fakturovaná suma", LX, ry + 2.7);
  style(12, "bold", ACCENT);
  text(`${money(inv.total_gross_cents)} EUR`, W - M - 1, ry + 2.9, { align: "right" });
  y = ry + 18;

  const signY = Math.max(y + 18, H - 44);
  rule(W - M - 60, signY, W - M, signY, RULE, 0.3);
  style(7.5, "normal", MUTED);
  text("Podpis a pečiatka", W - M, signY + 4, { align: "right" });

  // ═══ RUNNING HEADER (page 2+) + FOOTER ═══
  const pages = doc.getNumberOfPages();
  for (let pg = 1; pg <= pages; pg++) {
    doc.setPage(pg);
    if (pg > 1) {
      doc.setFillColor(...ACCENT);
      doc.rect(0, 0, W, 2.2, "F");
      style(9.5, "bold");
      text(s.name, M, 12);
      style(7.5, "normal", MUTED);
      text(`Odberateľ: ${c.name}`, M, 16.4);
      style(9.5, "bold", ACCENT);
      text(`${TITLE[inv.type]} ${inv.invoice_number}`, W - M, 12, { align: "right" });
      style(7.5, "normal", MUTED);
      text("pokračovanie", W - M, 16.4, { align: "right" });
      rule(M, 20, W - M, 20, RULE, 0.3);
    }
    const fy = H - 15;
    rule(M, fy - 5, W - M, fy - 5, RULE, 0.3);
    style(7.5, "normal", MUTED);
    text([s.name, s.email, s.phone].filter(Boolean).join("   ·   "), M, fy);
    text(`Strana ${pg} / ${pages}`, W - M, fy, { align: "right" });
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
