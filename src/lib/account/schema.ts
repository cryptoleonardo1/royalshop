import { z } from "zod";
import type { FieldErrors } from "@/lib/checkout-schema";

// Account form validation (registration, profile, password). Messages are customer-facing.

export const PASSWORD_MIN = 8;

const required = (msg: string, max = 120) =>
  z.string({ error: msg }).trim().max(max, `Najviac ${max} znakov`).min(1, msg);
const optional = (max: number) => z.string().trim().max(max, `Najviac ${max} znakov`).optional();
const email = z.string({ error: "Zadajte e-mail" }).trim().toLowerCase().pipe(z.email("Zadajte platný e-mail"));
const password = z
  .string({ error: "Zadajte heslo" })
  .min(PASSWORD_MIN, `Heslo musí mať aspoň ${PASSWORD_MIN} znakov`)
  .max(72, "Najviac 72 znakov");

export const registerSchema = z
  .object({
    firstName: required("Zadajte meno", 60),
    lastName: required("Zadajte priezvisko", 60),
    email,
    password,
    passwordAgain: z.string({ error: "Zopakujte heslo" }),
  })
  .refine((v) => v.password === v.passwordAgain, { path: ["passwordAgain"], message: "Heslá sa nezhodujú" });

export const passwordSchema = z
  .object({
    currentPassword: z.string({ error: "Zadajte súčasné heslo" }).min(1, "Zadajte súčasné heslo"),
    password,
    passwordAgain: z.string({ error: "Zopakujte heslo" }),
  })
  .refine((v) => v.password === v.passwordAgain, { path: ["passwordAgain"], message: "Heslá sa nezhodujú" });

export const profileSchema = z
  .object({
    customerType: z.enum(["person", "company"]),
    firstName: required("Zadajte meno", 60),
    lastName: required("Zadajte priezvisko", 60),
    phone: z
      .string()
      .trim()
      .refine((v) => /^\+?[0-9 ]{9,16}$/.test(v), "Zadajte telefón, napr. +421 900 123 456")
      .optional(),
    companyName: optional(160),
    ico: optional(12),
    dic: optional(12),
    icDph: optional(14),
    street: optional(120),
    city: optional(80),
    zip: optional(10),
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
    // the billing address is optional, but all or nothing
    if (v.street || v.city || v.zip) {
      if (!v.street) ctx.addIssue({ code: "custom", path: ["street"], message: "Zadajte ulicu a číslo" });
      if (!v.city) ctx.addIssue({ code: "custom", path: ["city"], message: "Zadajte mesto" });
      if (!/^\d{5}$/.test(v.zip?.replace(/\s+/g, "") ?? ""))
        ctx.addIssue({ code: "custom", path: ["zip"], message: "PSČ má 5 číslic" });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

export function parseForm<T>(
  schema: z.ZodType<T>,
  form: FormData,
): { ok: true; data: T } | { ok: false; errors: FieldErrors; values: Record<string, string> } {
  const raw: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") raw[key] = value;
  });
  const values = { ...raw };
  // passwords never travel back to the form
  for (const k of ["password", "passwordAgain", "currentPassword"]) delete values[k];
  // empty optional inputs arrive as "": treat them as absent
  for (const k of Object.keys(raw)) if (raw[k] === "") delete raw[k];
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return { ok: false, errors, values };
}

export const formatZip = (v: string) => {
  const d = v.replace(/\s+/g, "");
  return `${d.slice(0, 3)} ${d.slice(3)}`;
};
