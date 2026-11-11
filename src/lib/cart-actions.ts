"use server";

import { z } from "zod";
import { bladeReminders } from "@/lib/accessories";
import { getMachineBlades } from "@/lib/catalog";

const slugsSchema = z.array(z.string().min(1).max(200)).max(100);

// Read-only: machines in the browser cart that still need a diamond blade, with the blades that fit.
export async function cartBladeReminders(rawSlugs: unknown) {
  const parsed = slugsSchema.safeParse(rawSlugs);
  if (!parsed.success) return [];
  return bladeReminders(parsed.data, await getMachineBlades());
}
