import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadOrderDetail, type OrderDetail } from "@/lib/order-detail";
import type { OrderStatus } from "@/lib/order-state";

// Portal reads. The service role bypasses RLS, so every query here filters by the signed-in customer's id
// (from requireCustomer()) and selects customer-safe columns only.

export interface Profile {
  customerType: "person" | "company";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  ico: string;
  dic: string;
  icDph: string;
  billing: { street: string; city: string; zip: string } | null;
}

export async function getProfile(profileId: string): Promise<Profile | null> {
  const db = createAdminClient();
  const [{ data: p, error }, { data: address }] = await Promise.all([
    db
      .from("profiles")
      .select("customer_type, first_name, last_name, email, phone, company_name, ico, dic, ic_dph")
      .eq("id", profileId)
      .maybeSingle(),
    db
      .from("addresses")
      .select("street, city, zip")
      .eq("profile_id", profileId)
      .eq("type", "billing")
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (error) throw new Error(`Profile load failed: ${error.message}`);
  if (!p) return null;
  return {
    customerType: p.customer_type,
    firstName: p.first_name ?? "",
    lastName: p.last_name ?? "",
    email: p.email,
    phone: p.phone ?? "",
    companyName: p.company_name ?? "",
    ico: p.ico ?? "",
    dic: p.dic ?? "",
    icDph: p.ic_dph ?? "",
    billing: address ?? null,
  };
}

export interface OrderListRow {
  orderNumber: string;
  status: OrderStatus;
  totalGrossCents: number;
  createdAt: string;
  itemCount: number;
  firstItem: string;
}

export async function getMyOrders(profileId: string): Promise<OrderListRow[]> {
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("order_number, status, total_gross_cents, created_at, items:order_items(name, quantity)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Orders load failed: ${error.message}`);
  return data.map((o) => {
    const items = o.items as { name: string; quantity: number }[];
    return {
      orderNumber: o.order_number,
      status: o.status as OrderStatus,
      totalGrossCents: o.total_gross_cents,
      createdAt: o.created_at,
      itemCount: items.reduce((n, i) => n + i.quantity, 0),
      firstItem: items[0]?.name ?? "",
    };
  });
}

export function getMyOrder(profileId: string, orderNumber: string): Promise<OrderDetail | null> {
  return loadOrderDetail(createAdminClient(), orderNumber, { profileId });
}
