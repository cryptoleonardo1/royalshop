"use client";

import { useEffect, useState } from "react";
import type { MachineBlades } from "@/lib/accessories";
import type { ProductSummary } from "@/lib/catalog";
import { cartBladeReminders } from "@/lib/cart-actions";
import { AccessoryPicker } from "./accessory-picker";
import css from "./shop.module.css";

// A saw in the cart without a blade cannot cut: offer the blades that fit it, right in the cart.
export function BladeReminder({ slugs }: { slugs: string[] }) {
  const key = JSON.stringify(slugs);
  const [result, setResult] = useState<{ key: string; machines: MachineBlades<ProductSummary>[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    cartBladeReminders(JSON.parse(key)).then((machines) => {
      if (!cancelled) setResult({ key, machines });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  // keep the last answer while the next loads; a blade just added drops its reminder on the next answer
  const machines = result?.machines.filter((m) => slugs.includes(m.slug)) ?? [];
  if (machines.length === 0) return null;
  return (
    <div className={css.bladeReminders}>
      {machines.map((m) => (
        <AccessoryPicker
          key={m.slug}
          items={m.blades}
          title="Nezabudnite na diamantový kotúč"
          // the name ends with ", kotúč 400 mm, 230 V": keep the part before the specs
          note={`${m.name.split(",")[0]} sa dodáva bez kotúča. Vyberte si ho podľa materiálu, ktorý budete rezať.`}
        />
      ))}
    </div>
  );
}
