// Line-art "technical drawing" placeholders. Pure, no hooks: usable from server and client components.
import s from "./a.module.css";

export type ToolKind = "hammer" | "grinder" | "saw" | "wrench" | "plate";

type Stroke = { d: string; kind?: "detail" | "center" | "dash" };

const D: Record<ToolKind, Stroke[]> = {
  hammer: [
    { d: "M2 66 H182", kind: "center" },
    { d: "M44 63 H14 L7 66 L14 69 H44" },
    { d: "M44 56 H66 V76 H44 Z" },
    { d: "M50 56 V76 M56 56 V76", kind: "detail" },
    { d: "M66 50 H120 L128 44 H168 Q176 44 176 52 V84 Q176 92 168 92 H120 L112 86 H66 Z" },
    { d: "M118 92 V124 Q118 130 124 130 H162 Q168 130 168 124 V92" },
    { d: "M127 100 V122 M134 100 V122 M141 100 V122 M148 100 V122 M155 100 V122", kind: "detail" },
    { d: "M176 52 H200 Q216 52 216 68 V116 Q216 130 202 130 H168" },
    { d: "M184 64 H196 Q204 64 204 72 V110 Q204 118 196 118 H176 V98 H184 Z" },
    { d: "M190 64 V74 Q190 78 186 78", kind: "detail" },
    { d: "M80 92 L74 138 H88 L92 92" },
    { d: "M210 130 Q216 142 236 142", kind: "detail" },
  ],
  grinder: [
    { d: "M22 70 H232", kind: "center" },
    { d: "M33 14 V124", kind: "center" },
    { d: "M30 24 H36 V116 H30 Z" },
    { d: "M40 22 Q60 22 60 46 V58", kind: "detail" },
    { d: "M36 64 H48 V76 H36", kind: "detail" },
    { d: "M48 48 H86 Q94 48 94 56 V84 Q94 92 86 92 H48 Z" },
    { d: "M94 52 H170 Q176 52 178 58 V82 Q176 88 170 88 H94" },
    { d: "M110 52 V88 M116 52 V88", kind: "detail" },
    { d: "M132 61 H162 M132 67 H162 M132 73 H162 M132 79 H162", kind: "detail" },
    { d: "M178 58 H206 Q224 58 224 74 Q224 92 206 92 H178" },
    { d: "M186 66 H204 Q214 66 214 75 Q214 84 204 84 H186 Z" },
    { d: "M66 48 V20 H76 V48" },
    { d: "M224 76 Q234 78 236 96", kind: "detail" },
  ],
  saw: [
    { d: "M2 78 H130", kind: "center" },
    { d: "M12 72 Q4 72 4 78 Q4 84 12 84 H118 V72 Z" },
    { d: "M12 68.5 H118 M12 87.5 H118", kind: "dash" },
    { d: "M112 50 H176 Q192 50 196 66 L204 96 Q206 104 198 104 H120 Q112 104 112 96 Z" },
    { d: "M132 50 Q134 22 160 20 H196 Q212 20 214 36 L216 66" },
    { d: "M142 50 Q144 32 162 30 H194 Q204 30 205 40 L206 60", kind: "detail" },
    { d: "M196 66 H222 Q232 66 232 76 V100 Q232 110 222 110 H202" },
    { d: "M120 50 L116 30 Q116 24 122 24 L130 27" },
    { d: "M146 60 H184 V96 H146 Z" },
    { d: "M151 67 H179 M151 73 H179", kind: "detail" },
  ],
  wrench: [
    { d: "M14 51 H180", kind: "center" },
    { d: "M24 44 H40 V58 H24 Z" },
    { d: "M40 38 H62 V64 H40 Z" },
    { d: "M62 32 H150 Q168 32 168 49 Q168 66 150 66 H62 Z" },
    { d: "M136 40 V58 M143 40 V58 M150 40 V58", kind: "detail" },
    { d: "M102 66 L94 116 H128 L134 66" },
    { d: "M102 74 Q94 76 94 86 L99 88", kind: "detail" },
    { d: "M80 116 H150 Q156 116 156 122 V136 Q156 142 150 142 H80 Q74 142 74 136 V122 Q74 116 80 116 Z" },
    { d: "M82 124 H148", kind: "detail" },
  ],
  plate: [
    { d: "M113 20 V130", kind: "center" },
    { d: "M30 112 H196 L206 126 H20 Z" },
    { d: "M40 104 H190 V112 H40 Z" },
    { d: "M60 58 H140 V104 H60 Z" },
    { d: "M68 42 H118 Q128 42 128 52 V58 H68 Z" },
    { d: "M144 94 H180 V104 H144 Z", kind: "detail" },
    { d: "M172 104 L216 30 M182 104 L224 34" },
    { d: "M212 24 L234 38" },
  ],
};

export function kindFor(category: string): ToolKind {
  const c = category.toLowerCase();
  if (c.includes("kladiv")) return "hammer";
  if (c.includes("brúsk")) return "grinder";
  if (c.includes("píl")) return "saw";
  if (c.includes("uťahov")) return "wrench";
  return "plate";
}

export function ToolDrawing({
  kind,
  animate = false,
  viewBox = "0 0 240 150",
  className,
  children,
}: {
  kind: ToolKind;
  animate?: boolean;
  viewBox?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={`${s.drawing} ${animate ? s.drawingAnimate : ""} ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      {D[kind].map((p, i) =>
        p.kind === "center" || p.kind === "dash" ? (
          <path key={i} d={p.d} className={p.kind === "center" ? s.strokeCenter : s.strokeDash} />
        ) : (
          <path
            key={i}
            d={p.d}
            pathLength={1}
            className={p.kind === "detail" ? s.strokeDetail : s.strokeMain}
            style={{ "--k": i } as React.CSSProperties}
          />
        ),
      )}
      {kind === "plate" && (
        <>
          <circle cx="150" cy="72" r="13" pathLength={1} className={s.strokeMain} />
          <circle cx="94" cy="82" r="11" pathLength={1} className={s.strokeDetail} />
        </>
      )}
      {children}
    </svg>
  );
}

/** Horizontal dimension line with extension lines + arrowheads + label. SVG units. */
export function DimH({ x1, x2, y, from, label }: { x1: number; x2: number; y: number; from: number; label: string }) {
  const mid = (x1 + x2) / 2;
  return (
    <g className={s.dim}>
      <path d={`M${x1} ${from} V${y + 3} M${x2} ${from} V${y + 3}`} className={s.dimExt} />
      <path d={`M${x1} ${y} H${x2}`} />
      <path d={`M${x1 + 5} ${y - 2} L${x1} ${y} L${x1 + 5} ${y + 2} M${x2 - 5} ${y - 2} L${x2} ${y} L${x2 - 5} ${y + 2}`} />
      <rect x={mid - label.length * 2.1 - 3} y={y - 4.5} width={label.length * 4.2 + 6} height={9} className={s.dimLabelBg} />
      <text x={mid} y={y + 2.2} textAnchor="middle" className={s.dimText}>
        {label}
      </text>
    </g>
  );
}

export function DimV({ y1, y2, x, from, label }: { y1: number; y2: number; x: number; from: number; label: string }) {
  const mid = (y1 + y2) / 2;
  return (
    <g className={s.dim}>
      <path d={`M${from} ${y1} H${x + 3} M${from} ${y2} H${x + 3}`} className={s.dimExt} />
      <path d={`M${x} ${y1} V${y2}`} />
      <path d={`M${x - 2} ${y1 + 5} L${x} ${y1} L${x + 2} ${y1 + 5} M${x - 2} ${y2 - 5} L${x} ${y2} L${x + 2} ${y2 - 5}`} />
      <g transform={`rotate(-90 ${x} ${mid})`}>
        <rect x={x - label.length * 2.1 - 3} y={mid - 4.5} width={label.length * 4.2 + 6} height={9} className={s.dimLabelBg} />
        <text x={x} y={mid + 2.2} textAnchor="middle" className={s.dimText}>
          {label}
        </text>
      </g>
    </g>
  );
}

/** Numbered item balloon with a leader line pointing to (tx, ty). */
export function Balloon({ n, cx, cy, tx, ty }: { n: number; cx: number; cy: number; tx: number; ty: number }) {
  return (
    <g className={s.balloon} style={{ "--b": n } as React.CSSProperties}>
      <path d={`M${cx} ${cy} L${tx} ${ty}`} className={s.leader} />
      <circle cx={tx} cy={ty} r={1.3} className={s.leaderDot} />
      <circle cx={cx} cy={cy} r={6.5} className={s.balloonCircle} />
      <text x={cx} y={cy + 2.3} textAnchor="middle" className={s.balloonText}>
        {n}
      </text>
    </g>
  );
}

/** Battery pack outline for the platform picker. */
export function BatteryDrawing({ tall = false }: { tall?: boolean }) {
  const h = tall ? 62 : 48;
  const top = 86 - h;
  return (
    <svg viewBox="0 0 170 96" className={s.battery} aria-hidden="true" focusable="false">
      <path d="M8 90 H162" className={s.strokeCenter} />
      <path d={`M14 86 V${top + 6} Q14 ${top} 20 ${top} H150 Q156 ${top} 156 ${top + 6} V86 Z`} pathLength={1} className={s.strokeMain} />
      <path d={`M34 ${top} V${top - 10} H136 V${top}`} pathLength={1} className={s.strokeMain} />
      <path d={`M44 ${top - 10} V${top - 15} H126 V${top - 10}`} pathLength={1} className={s.strokeDetail} />
      <path d={`M24 ${top + 14} H146`} pathLength={1} className={s.strokeDetail} />
      <rect x="120" y={top + 22} width="7" height="4" className={s.batLed} />
      <rect x="130" y={top + 22} width="7" height="4" className={s.batLed} />
      <rect x="140" y={top + 22} width="7" height="4" className={s.batLedOff} />
    </svg>
  );
}
