import { describe, expect, it } from "vitest";
import { canCompleteOrder, withdrawalDeadline, withdrawalInfo } from "./withdrawal";
import { addWorkingDays, bratislavaMidnight, isSlovakHoliday } from "./sk-calendar";

describe("sk-calendar", () => {
  it("knows Easter and fixed holidays", () => {
    expect(isSlovakHoliday({ y: 2026, m: 4, d: 3 })).toBe(true); // Good Friday 2026
    expect(isSlovakHoliday({ y: 2026, m: 4, d: 6 })).toBe(true); // Easter Monday 2026
    expect(isSlovakHoliday({ y: 2026, m: 12, d: 24 })).toBe(true);
    expect(isSlovakHoliday({ y: 2026, m: 10, d: 23 })).toBe(false);
  });

  it("converts Bratislava midnight across DST", () => {
    expect(bratislavaMidnight({ y: 2026, m: 7, d: 1 }).toISOString()).toBe("2026-06-30T22:00:00.000Z");
    expect(bratislavaMidnight({ y: 2026, m: 12, d: 1 }).toISOString()).toBe("2026-11-30T23:00:00.000Z");
  });

  it("skips weekends and holidays when adding working days", () => {
    // Fri 23. 10. 2026 + 1 → Mon 26. 10.; Fri 30. 10. + 1 → Mon 2. 11. (1. 11. is a Sunday holiday anyway)
    expect(addWorkingDays(new Date("2026-10-23T10:00:00Z"), 1)).toEqual({ y: 2026, m: 10, d: 26 });
    expect(addWorkingDays(new Date("2026-12-23T10:00:00Z"), 1)).toEqual({ y: 2026, m: 12, d: 28 });
  });
});

describe("withdrawal window", () => {
  const person = { customer_type: "person" as const, status: "delivered" as const };

  it("ends 14 days after delivery at 23:59:59 Bratislava time", () => {
    // delivered Thu 1. 10. 2026 → Thu 15. 10. (CEST, UTC+2)
    expect(withdrawalDeadline(new Date("2026-10-01T10:00:00Z")).toISOString()).toBe("2026-10-15T21:59:59.999Z");
  });

  it("moves a weekend or holiday deadline to the next working day", () => {
    // delivered Sat 10. 10. → 24. 10. is a Saturday → Mon 26. 10.
    expect(withdrawalDeadline(new Date("2026-10-10T09:00:00Z")).toISOString()).toBe("2026-10-26T22:59:59.999Z");
    // delivered 10. 12. → 24. 12. (holiday) → 25., 26. holidays, 27. Sunday → Mon 28. 12.
    expect(withdrawalDeadline(new Date("2026-12-10T09:00:00Z")).toISOString()).toBe("2026-12-28T22:59:59.999Z");
  });

  it("uses the Bratislava day of a late-evening delivery", () => {
    // 23:30 Bratislava on 1. 10. is 21:30Z, still 1. 10. locally
    expect(withdrawalDeadline(new Date("2026-10-01T21:30:00Z")).toISOString()).toBe("2026-10-15T21:59:59.999Z");
  });

  it("classifies the order life cycle", () => {
    const delivered = "2026-10-01T10:00:00Z";
    expect(withdrawalInfo({ ...person, status: "pending_payment", delivered_at: null }).window).toBe("none");
    expect(withdrawalInfo({ ...person, status: "confirmed", delivered_at: null }).window).toBe("before_delivery");
    expect(withdrawalInfo({ ...person, customer_type: "company", delivered_at: delivered }).window).toBe("company");
    const open = withdrawalInfo({ ...person, delivered_at: delivered }, new Date("2026-10-13T08:00:00Z"));
    expect(open).toMatchObject({ window: "open", daysLeft: 2 });
    expect(withdrawalInfo({ ...person, delivered_at: delivered }, new Date("2026-10-15T20:00:00Z")).daysLeft).toBe(0);
    expect(withdrawalInfo({ ...person, delivered_at: delivered }, new Date("2026-10-17T08:00:00Z")).window).toBe("grace");
    expect(withdrawalInfo({ ...person, delivered_at: delivered }, new Date("2026-10-25T08:00:00Z")).window).toBe("closed");
    expect(withdrawalInfo({ ...person, delivered_at: delivered, hasWithdrawal: true }).window).toBe("withdrawn");
  });

  it("allows completing a consumer order only after the grace period", () => {
    const order = { ...person, delivered_at: "2026-10-01T10:00:00Z" };
    expect(canCompleteOrder(order, new Date("2026-10-16T08:00:00Z"))).toBe(false);
    expect(canCompleteOrder(order, new Date("2026-10-25T08:00:00Z"))).toBe(true);
    expect(canCompleteOrder({ ...order, customer_type: "company" }, new Date("2026-10-02T08:00:00Z"))).toBe(true);
  });
});
