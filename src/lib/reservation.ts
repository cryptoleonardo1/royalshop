// Non-binding reservations (persons). VOP čl. 3: if no purchase is agreed within 10 working days of the
// reservation, it lapses. "Agreed" = the admin moved it on (payment link or sale in the shop), so only orders
// still in `reserved` lapse. The whole last working day counts (Bratislava time).

import { addWorkingDays, endOfBratislavaDay } from "./sk-calendar";

export const RESERVATION_WORKDAYS = 10;

export function reservationExpiresAt(reservedAt: string | Date): Date {
  return endOfBratislavaDay(addWorkingDays(new Date(reservedAt), RESERVATION_WORKDAYS));
}

export function isReservationExpired(reservedAt: string | Date, now = new Date()): boolean {
  return reservationExpiresAt(reservedAt).getTime() < now.getTime();
}
