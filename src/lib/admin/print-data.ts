import "server-only";
import { notFound } from "next/navigation";
import { getShopSettings } from "@/lib/catalog";
import type { ContractPlace, OrderStatus, ShippingMethod } from "@/lib/order-state";
import { getOrderDetail } from "./orders-data";

// Data for the printed shop documents (purchase contract, handover protocol). getOrderDetail checks the admin.

export const PROVIDER_PRINT: Record<string, string> = {
  stripe: "kartou online",
  card_terminal: "kartou v predajni",
  cash: "v hotovosti",
  bank_transfer: "bankovým prevodom",
};

export interface PrintAddress {
  name: string;
  contact?: string;
  street: string;
  city: string;
  zip: string;
}

export interface PrintPayment {
  provider: string;
  amountCents: number;
  capturedAt: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function loadPrintData(cislo: string) {
  const [detail, settings] = await Promise.all([getOrderDetail(decodeURIComponent(cislo)), getShopSettings()]);
  if (!detail) notFound();
  const o = detail.order;
  const payments: PrintPayment[] = (o.payments as any[])
    .filter((p) => ["captured", "partially_refunded"].includes(p.status) && p.captured_at)
    .sort((a, b) => a.captured_at.localeCompare(b.captured_at))
    .map((p) => ({ provider: p.provider, amountCents: p.amount_cents - (p.refunded_cents ?? 0), capturedAt: p.captured_at }));
  const paidCents = payments.reduce((s, p) => s + p.amountCents, 0);
  return {
    settings,
    order: {
      number: o.order_number as string,
      status: o.status as OrderStatus,
      method: o.shipping_method as ShippingMethod,
      customerType: o.customer_type as "person" | "company",
      contractPlace: o.contract_place as ContractPlace,
      paymentStatus: o.payment_status as string,
      email: o.email as string,
      phone: (o.phone as string | null) ?? null,
      billing: o.billing as PrintAddress,
      shipping: (o.shipping_address as PrintAddress | null) ?? null,
      company: o.company as { name: string; ico: string; dic: string; ic_dph: string | null } | null,
      items: (o.items as any[]).map((i) => ({
        name: i.name as string,
        sku: (i.sku as string | null) ?? null,
        quantity: i.quantity as number,
        unitGrossCents: i.unit_price_gross_cents as number,
        lineGrossCents: i.line_gross_cents as number,
        serialNumber: (i.serial_number as string | null) ?? null,
      })),
      shippingPriceCents: o.shipping_price_cents as number,
      totalVatCents: o.total_vat_cents as number,
      totalGrossCents: o.total_gross_cents as number,
      estimatedDeliveryDate: (o.estimated_delivery_date as string | null) ?? null,
      deliveredAt: (o.delivered_at as string | null) ?? null,
      termsVersion: (o.terms_version as string | null) ?? null,
      payments,
      paidCents,
    },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export type PrintData = Awaited<ReturnType<typeof loadPrintData>>;
