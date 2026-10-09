import { z } from "zod";

// Checkout form validation (shared by the server action and tests). Messages are customer-facing.

const text = (max: number) => z.string().trim().max(max, `Najviac ${max} znakov`);
// z.string({ error }) so a missing field reports the Slovak message, not zod's type error
const required = (msg: string, max = 120) =>
  z.string({ error: msg }).trim().max(max, `Najviac ${max} znakov`).min(1, msg);
const zip = z
  .string({ error: "Zadajte PSČ" })
  .trim()
  .transform((v) => v.replace(/\s+/g, ""))
  .refine((v) => /^\d{5}$/.test(v), "PSČ má 5 číslic")
  .transform((v) => `${v.slice(0, 3)} ${v.slice(3)}`);

export const cartLinesSchema = z
  .array(z.object({ slug: z.string().min(1).max(200), quantity: z.number().int().min(1).max(99) }))
  .min(1, "Košík je prázdny")
  .max(100);

export const checkoutSchema = z
  .object({
    customerType: z.enum(["person", "company"], { error: "Vyberte, či nakupujete ako osoba alebo firma" }),
    firstName: required("Zadajte meno", 60),
    lastName: required("Zadajte priezvisko", 60),
    email: z.string({ error: "Zadajte e-mail" }).trim().toLowerCase().pipe(z.email("Zadajte platný e-mail")),
    phone: z
      .string({ error: "Zadajte telefón" })
      .trim()
      .refine((v) => /^\+?[0-9 ]{9,16}$/.test(v), "Zadajte telefón, napr. +421 900 123 456"),
    street: required("Zadajte ulicu a číslo"),
    city: required("Zadajte mesto", 80),
    zip,
    companyName: text(160).optional(),
    ico: text(12).optional(),
    dic: text(12).optional(),
    icDph: text(14).optional(),
    shipDifferent: z.literal("on").optional(),
    shipName: text(120).optional(),
    shipStreet: text(120).optional(),
    shipCity: text(80).optional(),
    shipZip: z.string().optional(),
    shippingMethod: z.enum(["courier", "own_transport", "pickup_senec"], { error: "Vyberte spôsob dopravy" }),
    zoneId: z.uuid().optional().or(z.literal("")),
    note: text(1000).optional(),
    terms: z.literal("on", { error: "Bez súhlasu s obchodnými podmienkami objednávku neodošleme" }),
    lines: z.string({ error: "Košík je prázdny" }).transform((raw, ctx) => {
      try {
        return cartLinesSchema.parse(JSON.parse(raw));
      } catch {
        ctx.addIssue({ code: "custom", message: "Košík je prázdny alebo neplatný" });
        return z.NEVER;
      }
    }),
  })
  .superRefine((v, ctx) => {
    if (v.customerType === "company") {
      if (!v.companyName) ctx.addIssue({ code: "custom", path: ["companyName"], message: "Zadajte obchodné meno" });
      if (!/^\d{6,8}$/.test(v.ico?.replace(/\s+/g, "") ?? ""))
        ctx.addIssue({ code: "custom", path: ["ico"], message: "IČO má 6 až 8 číslic" });
      if (!/^\d{10}$/.test(v.dic?.replace(/\s+/g, "") ?? ""))
        ctx.addIssue({ code: "custom", path: ["dic"], message: "DIČ má 10 číslic" });
      if (v.icDph && !/^[A-Z]{2}\d{8,12}$/.test(v.icDph.replace(/\s+/g, "").toUpperCase()))
        ctx.addIssue({ code: "custom", path: ["icDph"], message: "IČ DPH v tvare SK1234567890" });
    }
    if (v.shipDifferent && v.shippingMethod !== "pickup_senec") {
      if (!v.shipName) ctx.addIssue({ code: "custom", path: ["shipName"], message: "Zadajte meno príjemcu" });
      if (!v.shipStreet) ctx.addIssue({ code: "custom", path: ["shipStreet"], message: "Zadajte ulicu a číslo" });
      if (!v.shipCity) ctx.addIssue({ code: "custom", path: ["shipCity"], message: "Zadajte mesto" });
      if (!/^\d{5}$/.test(v.shipZip?.replace(/\s+/g, "") ?? ""))
        ctx.addIssue({ code: "custom", path: ["shipZip"], message: "PSČ má 5 číslic" });
    }
    if (v.shippingMethod === "own_transport" && !v.zoneId)
      ctx.addIssue({ code: "custom", path: ["zoneId"], message: "Vyberte vzdialenosť od Senca" });
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type FieldErrors = Partial<Record<string, string>>;

export function parseCheckout(form: FormData): { ok: true; data: CheckoutInput } | { ok: false; errors: FieldErrors } {
  const raw: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") raw[key] = value;
  });
  // empty optional inputs arrive as "": treat them as absent
  for (const k of Object.keys(raw)) if (raw[k] === "" && k !== "lines") delete raw[k];
  const result = checkoutSchema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return { ok: false, errors };
}

const formatZip = (v: string) => {
  const d = v.replace(/\s+/g, "");
  return `${d.slice(0, 3)} ${d.slice(3)}`;
};

// Snapshots stored on the order (same shape as the seed data).
export function orderSnapshots(v: CheckoutInput) {
  const person = `${v.firstName} ${v.lastName}`;
  const billing = {
    name: v.customerType === "company" ? v.companyName! : person,
    contact: person,
    street: v.street,
    city: v.city,
    zip: v.zip,
    country: "SK",
  };
  const company =
    v.customerType === "company"
      ? {
          name: v.companyName!,
          ico: v.ico!.replace(/\s+/g, ""),
          dic: v.dic!.replace(/\s+/g, ""),
          ic_dph: v.icDph ? v.icDph.replace(/\s+/g, "").toUpperCase() : null,
        }
      : null;
  const shipping =
    v.shippingMethod === "pickup_senec"
      ? null
      : v.shipDifferent
        ? { name: v.shipName!, street: v.shipStreet!, city: v.shipCity!, zip: formatZip(v.shipZip!), country: "SK" }
        : { name: person, street: v.street, city: v.city, zip: v.zip, country: "SK" };
  return { billing, company, shipping };
}
