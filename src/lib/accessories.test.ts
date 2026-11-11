import { describe, expect, it } from "vitest";
import { bladeIncluded, bladeReminders, type MachineBlades } from "./accessories";

const fits: MachineBlades<{ slug: string }>[] = [
  { slug: "ms400", name: "MS400", bladeIncluded: false, blades: [{ slug: "rx1s" }, { slug: "lb20" }] },
  { slug: "ts250", name: "TS250", bladeIncluded: true, blades: [{ slug: "slf10" }] },
  { slug: "ts250a", name: "TS250A", bladeIncluded: false, blades: [{ slug: "slf10" }] },
  { slug: "mixer", name: "Miešačka", bladeIncluded: false, blades: [] },
];

const slugs = (list: MachineBlades<{ slug: string }>[]) => list.map((m) => m.slug);

describe("bladeReminders", () => {
  it("reminds for a machine without any fitting blade in the cart", () => {
    expect(slugs(bladeReminders(["ms400"], fits))).toEqual(["ms400"]);
  });
  it("stays quiet once any fitting blade is in the cart", () => {
    expect(bladeReminders(["ms400", "lb20"], fits)).toEqual([]);
  });
  it("ignores machines that ship with a blade or have no blades", () => {
    expect(bladeReminders(["ts250", "mixer"], fits)).toEqual([]);
  });
  it("a blade for another machine does not count", () => {
    expect(slugs(bladeReminders(["ms400", "ts250a", "slf10"], fits))).toEqual(["ms400"]);
  });
  it("blades alone in the cart need no reminder", () => {
    expect(bladeReminders(["rx1s"], fits)).toEqual([]);
  });
});

describe("bladeIncluded", () => {
  it("reads the blade_included spec", () => {
    expect(bladeIncluded([{ key: "blade_included", value: "áno (SLF10 Ø 250 mm)" }])).toBe(true);
    expect(bladeIncluded([{ key: "blade_included", value: "nie" }])).toBe(false);
    expect(bladeIncluded([])).toBe(false);
  });
});
