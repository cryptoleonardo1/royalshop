import {
  AudioWaveform,
  BrickWall,
  Cog,
  Disc3,
  Drill,
  Fan,
  Gauge,
  Hammer,
  Package,
  PencilRuler,
  Trees,
  Waves,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import { ActiveSection } from "./listing-nav";
import css from "./shop.module.css";

// The icon set has no saw: a toothed blade drawn in the same 24 px line style.
function SawBlade({ className, strokeWidth = 1 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.00 2.00 L14.16 4.71 L17.00 3.34 L17.51 6.77 L20.66 7.00 L19.39 10.23 L22.00 12.00 L19.29 14.16 L20.66 17.00 L17.23 17.51 L17.00 20.66 L13.77 19.39 L12.00 22.00 L9.84 19.29 L7.00 20.66 L6.49 17.23 L3.34 17.00 L4.61 13.77 L2.00 12.00 L4.71 9.84 L3.34 7.00 L6.77 6.49 L7.00 3.34 L10.23 4.61 Z" />
      <circle cx="12" cy="12" r="2.2" />
    </svg>
  );
}

// One line-art mark per top-level category. Unknown slugs get no mark (the page head stays plain).
const ZONE_ICONS: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "vibracna-technika": AudioWaveform,
  elektrocentraly: Zap,
  cerpadla: Waves,
  "rezacia-technika": Disc3,
  "betonarska-technika": BrickWall,
  motory: Cog,
  prislusenstvo: Package,
  "vrtacky-a-skrutkovace": Drill,
  kladiva: Hammer,
  brusky: Fan,
  pily: SawBlade,
  "frezy-a-hobliky": PencilRuler,
  "zahradna-technika": Trees,
  vysavace: Wind,
  "klincovacky-a-kompresory": Gauge,
  "ostatne-naradie": Wrench,
};

/**
 * Quiet backdrop of a category page head: blueprint grid fading in from the right, a large faint mark of
 * the top-level category and its position in the menu. Tells the customer which part of the shop they are
 * in without competing with the title. It also keeps that category underlined in the header menu.
 */
export function CategoryZone({ rootSlug, index, count }: { rootSlug: string; index: number; count: number }) {
  const Icon = ZONE_ICONS[rootSlug];
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <>
      <ActiveSection slug={rootSlug} />
      <div className={css.zone} aria-hidden="true">
        {index > 0 && (
          <span className={css.zoneTag}>
            Sekcia {pad(index)} / {pad(count)}
          </span>
        )}
        {Icon && <Icon className={css.zoneIcon} strokeWidth={1} />}
      </div>
    </>
  );
}
