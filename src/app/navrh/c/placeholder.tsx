import { Drill, Hammer, Wrench, Disc3, Axe, Construction, Package } from "lucide-react";
import css from "./stavenisko.module.css";

function categoryIcon(category: string, size: number) {
  const props = { size, strokeWidth: 1.5, "aria-hidden": true } as const;
  switch (category) {
    case "Kladivá":
      return <Hammer {...props} />;
    case "AKU kladivá":
      return <Drill {...props} />;
    case "Uťahováky":
      return <Wrench {...props} />;
    case "Brúsky":
      return <Disc3 {...props} />;
    case "Píly":
      return <Axe {...props} />;
    case "Vibračné dosky":
      return <Construction {...props} />;
    default:
      return <Package {...props} />;
  }
}

/**
 * Intentional "photo pending" plate: blueprint grid, crop marks, stencil SKU and a
 * label-maker strip — reads as a designed slot in the catalogue, not a broken image.
 */
export function Placeholder({
  sku,
  name,
  category,
  view,
  large = false,
}: {
  sku: string;
  name: string;
  category: string;
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
      <span className={css.plateIcon}>{categoryIcon(category, large ? 88 : 56)}</span>
      <span className={css.plateSku} aria-hidden="true">
        {sku}
      </span>
      <span className={css.plateNote} aria-hidden="true">
        {view ? view : "Foto · pripravujeme"}
      </span>
    </div>
  );
}
