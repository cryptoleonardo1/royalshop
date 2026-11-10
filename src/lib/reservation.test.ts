import { describe, expect, it } from "vitest";
import { isReservationExpired, reservationExpiresAt } from "./reservation";

describe("reservation expiry (10 working days)", () => {
  it("counts working days only and ends at Bratislava midnight", () => {
    // Tue 13. 10. 2026 → 10 working days later is Tue 27. 10. 2026 (no holiday in between)
    const at = reservationExpiresAt("2026-10-13T09:00:00Z");
    expect(at.toISOString()).toBe("2026-10-27T22:59:59.999Z");
  });

  it("skips Slovak holidays", () => {
    // Fri 13. 11. 2026: 16. 11. – 27. 11. would be 10 working days, but 17. 11. counts as a holiday (sk-calendar keeps it, conservative) → Mon 30. 11.
    expect(reservationExpiresAt("2026-11-13T10:00:00Z").toISOString()).toBe("2026-11-30T22:59:59.999Z");
  });

  it("is still valid on the last day and lapses after it", () => {
    const reserved = "2026-10-13T09:00:00Z";
    expect(isReservationExpired(reserved, new Date("2026-10-27T21:00:00Z"))).toBe(false);
    expect(isReservationExpired(reserved, new Date("2026-10-27T23:00:01Z"))).toBe(true);
  });
});
