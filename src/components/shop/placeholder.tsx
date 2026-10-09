import {
  Axe,
  BatteryCharging,
  Briefcase,
  Construction,
  Disc3,
  Drill,
  Fan,
  Hammer,
  Leaf,
  Package,
  Wrench,
} from "lucide-react";
import css from "./shop.module.css";

const ICONS: [RegExp, typeof Package][] = [
  [/kladiv/, Hammer],
  [/utahova/, Wrench],
  [/vrtack|skrutkova|zemne-vrtaky/, Drill],
  [/brusk|kotuc/, Disc3],
  [/pily|pila|rezacky/, Axe],
  [/vibracne|miesadla|stavebne/, Construction],
  [/kosack|krovinorez|zahrad/, Leaf],
  [/baterie|nabijack/, BatteryCharging],
  [/vysavac/, Fan],
  [/kufre/, Briefcase],
];

function categoryIcon(categorySlug: string, size: number) {
  const Icon = ICONS.find(([re]) => re.test(categorySlug))?.[1] ?? Package;
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />;
}

/**
 * Intentional "photo pending" plate: blueprint grid, crop marks, stencil SKU and a
 * label-maker strip — reads as a designed slot in the catalogue, not a broken image.
 */
export function Placeholder({
  sku,
  name,
  categorySlug,
  view,
  large = false,
}: {
  sku: string | null;
  name: string;
  categorySlug: string;
  view?: string;
  large?: boolean;
}) {
  return (
    <div
      className={`${css.plate} ${large ? css.plateLarge : ""}`}
      role="img"
      aria-label={`${name}${view ? ` – ${view}` : ""}: fotografia sa pripravuje`}
    >
      <span className={css.plateCrop} aria-hidden="true" />
      <span className={css.plateIcon}>{categoryIcon(categorySlug, large ? 88 : 56)}</span>
      {sku && (
        <span className={css.plateSku} aria-hidden="true">
          {sku}
        </span>
      )}
      <span className={css.plateNote} aria-hidden="true">
        {view ?? "Foto · pripravujeme"}
      </span>
    </div>
  );
}
