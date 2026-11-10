import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { transitionOrder } from "./orders";
import { isReservationExpired, RESERVATION_WORKDAYS } from "./reservation";
import type { ShippingMethod } from "./order-state";

// Cancels reservations nobody agreed on within 10 working days (VOP čl. 3). Run daily by the cron route.
// A reservation carries no payment, so nothing is refunded. Concurrent admin steps win (optimistic lock).

export async function expireReservations(db: SupabaseClient, now = new Date()): Promise<{ cancelled: string[] }> {
  const { data, error } = await db
    .from("orders")
    .select("id, order_number, status, shipping_method, reserved_at")
    .eq("status", "reserved")
    .not("reserved_at", "is", null);
  if (error) throw new Error(`Reservations: load failed: ${error.message}`);

  const cancelled: string[] = [];
  for (const o of data ?? []) {
    if (!isReservationExpired(o.reserved_at, now)) continue;
    const moved = await transitionOrder(
      db,
      { id: o.id, status: "reserved", shipping_method: o.shipping_method as ShippingMethod },
      "cancelled",
      {
        note: `Rezervácia zanikla automaticky: do ${RESERVATION_WORKDAYS} pracovných dní sme sa nedohodli na kúpe (VOP čl. 3).`,
        patch: { payment_status: "cancelled" },
      },
    );
    if (moved) cancelled.push(o.order_number);
  }
  return { cancelled };
}
