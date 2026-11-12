import type { ReactNode } from "react";
import type { Ingredient, Vessel as VesselKind } from "@/lib/coffee/ingredients";

/**
 * A container on the shelf, drawn see-through so the fill level shows. The
 * dashed red line is the reorder point.
 */

interface Shape {
  body: string;
  /** Inside, from the highest the contents can reach to the bottom. */
  top: number;
  bottom: number;
  left: number;
  right: number;
  details: () => ReactNode;
}

const stroke = { stroke: "var(--color-jade)", strokeWidth: 2.5, strokeLinejoin: "round" as const };

const SHAPES: Record<VesselKind, Shape> = {
  bag: {
    body: "M21 136Q16 136 16.5 130L19 48H81L83.5 130Q84 136 79 136Z",
    top: 50,
    bottom: 134,
    left: 18,
    right: 82,
    details: () => (
      <>
        <rect x="17" y="30" width="66" height="18" rx="2" fill="var(--color-porcelain)" {...stroke} />
        <path d="M24 36h52M24 42h52" stroke="var(--color-tile)" strokeWidth="2" />
      </>
    ),
  },
  carton: {
    body: "M24 136V56H76V136Z",
    top: 58,
    bottom: 134,
    left: 24,
    right: 76,
    details: () => (
      <>
        <path d="M24 56L33 36H67L76 56Z" fill="var(--color-porcelain)" {...stroke} />
        <rect x="31" y="27" width="38" height="9" rx="1.5" fill="var(--color-porcelain)" {...stroke} />
      </>
    ),
  },
  bottle: {
    body: "M31 136Q26 136 26 131V68Q26 56 38 52H62Q74 56 74 68V131Q74 136 69 136Z",
    top: 64,
    bottom: 134,
    left: 26,
    right: 74,
    details: () => (
      <>
        <rect x="38" y="40" width="24" height="12" rx="2" fill="var(--color-jade)" />
        <rect x="46.5" y="26" width="7" height="14" fill="var(--color-porcelain)" {...stroke} />
        <path d="M46 21h25v6H50" fill="var(--color-porcelain)" {...stroke} />
      </>
    ),
  },
  jar: {
    body: "M26 46H74Q80 46 80 52V128Q80 136 72 136H28Q20 136 20 128V52Q20 46 26 46Z",
    top: 50,
    bottom: 134,
    left: 20,
    right: 80,
    details: () => <rect x="17" y="32" width="66" height="14" rx="3" fill="var(--color-jade)" />,
  },
  tin: {
    body: "M22 74H78V136H22Z",
    top: 76,
    bottom: 134,
    left: 22,
    right: 78,
    details: () => (
      <>
        <rect x="19" y="68" width="62" height="7" rx="2" fill="var(--color-porcelain)" {...stroke} />
        <path d="M22 130H78" stroke="var(--color-jade)" strokeWidth="2" opacity="0.5" />
      </>
    ),
  },
};

export function VesselDrawing({
  ingredient,
  fill,
  reorderFill,
  className,
}: {
  ingredient: Pick<Ingredient, "id" | "vessel" | "color">;
  /** 0–1 */
  fill: number;
  /** 0–1, where the reorder line sits */
  reorderFill: number;
  className?: string;
}) {
  const s = SHAPES[ingredient.vessel];
  const id = `vessel-${ingredient.id}`;
  const height = s.bottom - s.top;
  const drop = (1 - fill) * height;
  const reorderY = s.bottom - reorderFill * height;
  const grainy = ingredient.vessel === "bag" || ingredient.vessel === "jar";

  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden="true">
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={s.body} />
        </clipPath>
        {grainy && (
          <pattern id={`${id}-grain`} width="12" height="10" patternUnits="userSpaceOnUse">
            {ingredient.vessel === "bag" ? (
              <>
                <ellipse cx="3.5" cy="3" rx="2.6" ry="1.9" fill="#3a1f12" transform="rotate(-25 3.5 3)" />
                <ellipse cx="9.5" cy="8" rx="2.6" ry="1.9" fill="#7a4a2c" transform="rotate(30 9.5 8)" />
              </>
            ) : (
              <>
                <circle cx="2" cy="2" r="0.9" fill="#5a3a25" />
                <circle cx="8" cy="6" r="0.9" fill="#5a3a25" />
              </>
            )}
          </pattern>
        )}
      </defs>

      <path d={s.body} fill="var(--color-mint)" />
      <g clipPath={`url(#${id}-clip)`}>
        <g
          style={{ transform: `translateY(${drop}px)`, transition: "transform .8s cubic-bezier(.3,.7,.4,1)" }}
        >
          <rect x="0" y={s.top} width="100" height={height + 4} fill={ingredient.color} />
          {grainy && <rect x="0" y={s.top} width="100" height={height + 4} fill={`url(#${id}-grain)`} />}
          <rect x="0" y={s.top} width="100" height="2.5" fill="var(--color-jade)" opacity="0.35" />
        </g>
        <line
          x1={s.left}
          x2={s.right}
          y1={reorderY}
          y2={reorderY}
          stroke="var(--color-chili)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      </g>
      <path d={s.body} fill="none" {...stroke} />
      {s.details()}
    </svg>
  );
}
