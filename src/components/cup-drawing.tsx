import type { CSSProperties } from "react";
import { joinList, type Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { CupKind, LayerKind, Recipe } from "@/lib/coffee/recipes";

/**
 * A cross-section of a drink: the cup's walls with each layer stacked inside,
 * bottom to top. Static on the menu; on a recipe page `PourStage` decides
 * which layers are in and the CSS transitions pour them.
 */

const W = 240;
const CX = W / 2;
const FLOOR = 248; // where every cup sits
const SPOUT = 18; // where a pour stream starts
const SAUCER = 11; // how tall a saucer is
const GROUND = FLOOR + SAUCER; // the counter top

interface CupShape {
  top: number;
  bottom: number;
  height: number;
  round: number;
  wall: "ceramic" | "glass" | "kopitiam";
  handle?: "small" | "large";
  saucer?: boolean;
  /** Curved sides that run straight into the rim, like a cappuccino cup. */
  bowl?: boolean;
  capacity: number;
}

const CUPS: Record<CupKind, CupShape> = {
  demitasse: {
    top: 92,
    bottom: 46,
    height: 68,
    round: 22,
    bowl: true,
    wall: "ceramic",
    handle: "small",
    saucer: true,
    capacity: 90,
  },
  gibraltar: {
    top: 90,
    bottom: 74,
    height: 98,
    round: 8,
    wall: "glass",
    capacity: 140,
  },
  cup: {
    top: 138,
    bottom: 64,
    height: 92,
    round: 34,
    bowl: true,
    wall: "ceramic",
    handle: "small",
    saucer: true,
    capacity: 200,
  },
  mug: {
    top: 114,
    bottom: 104,
    height: 138,
    round: 14,
    wall: "ceramic",
    handle: "large",
    capacity: 300,
  },
  "tall-glass": {
    top: 100,
    bottom: 78,
    height: 186,
    round: 10,
    wall: "glass",
    capacity: 330,
  },
  kopitiam: {
    top: 112,
    bottom: 64,
    height: 100,
    round: 22,
    bowl: true,
    wall: "kopitiam",
    handle: "small",
    saucer: true,
    capacity: 220,
  },
};

export const LAYER_STYLE: Record<LayerKind, { fill: string }> = {
  espresso: { fill: "#4a2414" },
  water: { fill: "#d5e9f1" },
  milk: { fill: "#f6e9d3" },
  foam: { fill: "#fffdf8" },
  chocolate: { fill: "#3a190e" },
  vanilla: { fill: "#ecc670" },
  caramel: { fill: "#b66d28" },
  kopi: { fill: "#2c160b" },
  condensed: { fill: "#f3dc9f" },
};

/** A bowl's side as a cubic curve from the flat base (p0) up to the rim (p3). */
function bowlSide(c: CupShape, side: -1 | 1) {
  return [
    { x: CX + (side * c.bottom) / 2, y: FLOOR },
    { x: CX + side * (c.bottom / 2 + c.round), y: FLOOR },
    { x: CX + (side * c.top) / 2, y: FLOOR - c.height * 0.55 },
    { x: CX + (side * c.top) / 2, y: FLOOR - c.height },
  ];
}

const bezier = (p: { x: number; y: number }[], s: number) => {
  const u = 1 - s;
  const [a, b, c, d] = [u * u * u, 3 * u * u * s, 3 * u * s * s, s * s * s];
  return {
    x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
    y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
  };
};

/** Point on the cup's left or right wall, `t` of the way from rim (0) to base (1). */
function wallPoint(c: CupShape, side: -1 | 1, t: number) {
  const y = FLOOR - c.height + c.height * t;
  if (c.bowl) {
    // The curve rises steadily, so bisect for the point at height y.
    const curve = bowlSide(c, side);
    let [lo, hi] = [0, 1];
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (bezier(curve, mid).y > y) lo = mid;
      else hi = mid;
    }
    return bezier(curve, lo);
  }
  const top = CX + (side * c.top) / 2;
  const bottom = CX + (side * c.bottom) / 2;
  return { x: top + (bottom - top) * t, y };
}

function cupPath(c: CupShape, closed: boolean) {
  if (c.bowl) {
    const [l0, l1, l2, l3] = bowlSide(c, -1);
    const [r0, r1, r2, r3] = bowlSide(c, 1);
    const d =
      `M${l3.x} ${l3.y}C${l2.x} ${l2.y} ${l1.x} ${l1.y} ${l0.x} ${l0.y}` +
      `L${r0.x} ${r0.y}C${r1.x} ${r1.y} ${r2.x} ${r2.y} ${r3.x} ${r3.y}`;
    return closed ? `${d}Z` : d;
  }
  const t = 1 - c.round / c.height;
  const tl = wallPoint(c, -1, 0);
  const tr = wallPoint(c, 1, 0);
  const pl = wallPoint(c, -1, t);
  const pr = wallPoint(c, 1, t);
  const bl = CX - c.bottom / 2;
  const br = CX + c.bottom / 2;
  const k = Math.min(c.round, c.bottom / 2 - 1);
  const d =
    `M${tl.x} ${tl.y}L${pl.x} ${pl.y}Q${bl} ${FLOOR} ${bl + k} ${FLOOR}` +
    `L${br - k} ${FLOOR}Q${br} ${FLOOR} ${pr.x} ${pr.y}L${tr.x} ${tr.y}`;
  return closed ? `${d}Z` : d;
}

function handlePath(c: CupShape) {
  const large = c.handle === "large";
  const a = wallPoint(c, 1, large ? 0.16 : 0.2);
  const b = wallPoint(c, 1, large ? 0.74 : 0.6);
  const reach = large ? 40 : 30;
  return `M${a.x - 2} ${a.y}C${a.x + reach} ${a.y - 6} ${b.x + reach} ${b.y + 6} ${b.x - 2} ${b.y}`;
}

/** Stack layers from the bottom. The caramel drizzle has no depth; it sits on whatever is below it. */
function stackLayers(layers: Recipe["layers"], floor: number, pxPerMl: number) {
  return layers.reduce<Array<Recipe["layers"][number] & { y: number; h: number }>>((bands, layer) => {
    const h = layer.kind === "caramel" ? 0 : layer.ml * pxPerMl;
    const below = bands.at(-1)?.y ?? floor;
    return [...bands, { ...layer, y: below - h, h }];
  }, []);
}

export interface CupDrawingProps {
  recipe: Pick<Recipe, "slug" | "name" | "cup" | "layers">;
  /** Which layers are in the cup. Defaults to all of them. */
  poured?: ReadonlySet<LayerKind>;
  /** The layer being poured right now, to draw its stream. */
  pouring?: LayerKind | null;
  /** Restarts the stream animation when it changes. */
  pourKey?: string | number;
  steaming?: boolean;
  /** No transitions: for small menu drawings. */
  still?: boolean;
  /** Stand the cup on a marble counter that runs to the edges of its container. */
  counter?: boolean;
  className?: string;
  title?: string;
}

export function CupDrawing({
  recipe,
  poured,
  pouring = null,
  pourKey,
  steaming = false,
  still = false,
  counter = false,
  className,
  title,
}: CupDrawingProps) {
  const c = CUPS[recipe.cup];
  const id = `cup-${recipe.slug}${still ? "-still" : ""}`;
  const glass = c.wall === "glass";
  const floorThickness = glass ? 7 : 3;
  const usable = c.height - floorThickness - 6;
  const rim = FLOOR - c.height;

  const bands = stackLayers(recipe.layers, FLOOR - floorThickness, usable / c.capacity);
  const surfaceBelow = (kind: LayerKind) => {
    const i = bands.findIndex((b) => b.kind === kind);
    return i <= 0 ? FLOOR - floorThickness : bands[i - 1].y;
  };

  const isIn = (kind: LayerKind) => !poured || poured.has(kind);
  const streamable = pouring && pouring !== "foam" && pouring !== "caramel";

  return (
    <svg
      // Menu drawings skip the headroom for the pour stream and steam; every cup keeps the same scale.
      viewBox={still ? `0 52 ${W} ${FLOOR + 22 - 52}` : `0 0 ${W} ${counter ? GROUND + 46 : FLOOR + 22}`}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      overflow={counter ? "visible" : undefined}
    >
      <defs>
        <clipPath id={`${id}-inside`}>
          <path d={cupPath(c, true)} />
        </clipPath>
        <clipPath id={`${id}-rim`}>
          <rect x="0" y={rim - 10} width={W} height="22" />
        </clipPath>
        <pattern id={`${id}-bubbles`} width="14" height="12" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2.2" fill="none" stroke="#e7dcc9" strokeWidth="1" />
          <circle cx="11" cy="9" r="1.5" fill="none" stroke="#e7dcc9" strokeWidth="1" />
        </pattern>
      </defs>

      {counter && (
        <g>
          <rect x={-W} y={GROUND} width={W * 3} height="160" fill="var(--color-counter)" />
          <rect x={-W} y={GROUND} width={W * 3} height="2" fill="var(--color-cup-line)" opacity="0.18" />
          <path
            d={`M-40 ${GROUND + 30}c60 -8 90 10 150 2s110 -14 180 4M-20 ${GROUND + 56}c80 6 130 -12 210 -4`}
            fill="none"
            stroke="var(--color-tile)"
            strokeWidth="1.5"
          />
        </g>
      )}

      {/* Cups without a saucer sit lower, so every drink stands on the same ground. */}
      <g transform={c.saucer ? undefined : `translate(0 ${SAUCER})`}>
        <ellipse
          cx={CX}
          cy={c.saucer ? GROUND : FLOOR}
          rx={c.top / 2 + (c.saucer ? 42 : 14)}
          ry="4"
          fill="var(--color-cup-line)"
          opacity="0.1"
        />

        {c.saucer && (
          <path
            d={`M${CX - c.top / 2 - 34} ${FLOOR}L${CX + c.top / 2 + 34} ${FLOOR}Q${CX + c.top / 2 + 24} ${GROUND} ${CX + c.top / 2 + 6} ${GROUND}L${CX - c.top / 2 - 6} ${GROUND}Q${CX - c.top / 2 - 24} ${GROUND} ${CX - c.top / 2 - 34} ${FLOOR}Z`}
            fill="var(--color-ceramic)"
            stroke="var(--color-cup-line)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}

        {c.handle && (
          <g fill="none" strokeLinecap="round">
            <path d={handlePath(c)} stroke="var(--color-cup-line)" strokeWidth="11" />
            <path d={handlePath(c)} stroke="var(--color-ceramic)" strokeWidth="6" />
          </g>
        )}

        {/* The inside of the cup */}
        <g clipPath={`url(#${id}-inside)`}>
          <rect
            x="0"
            y={rim}
            width={W}
            height={c.height}
            fill={glass ? "var(--color-glass-air)" : "var(--color-ceramic-inside)"}
          />
          {glass && (
            <rect
              x="0"
              y={FLOOR - floorThickness}
              width={W}
              height={floorThickness}
              fill="var(--color-glass-base)"
            />
          )}
        </g>

        {streamable && (
          <rect
            key={pourKey}
            className="liquid"
            x={CX - (pouring === "espresso" ? 2.5 : 4)}
            y={SPOUT}
            width={pouring === "espresso" ? 5 : 8}
            height={surfaceBelow(pouring) - SPOUT}
            rx="2.5"
            fill={LAYER_STYLE[pouring].fill}
            stroke={pouring === "water" ? "#b6d4e1" : "none"}
            style={{
              transformOrigin: "50% 0",
              animation: "pour 1.3s ease-in-out both",
            }}
          />
        )}

        <g clipPath={`url(#${id}-inside)`}>
          {bands.map((band) => {
            const on = isIn(band.kind);
            const fill = LAYER_STYLE[band.kind].fill;
            const motion: CSSProperties = still
              ? {}
              : {
                  transition: on ? "transform 1s cubic-bezier(.3,.7,.4,1)" : "transform .35s ease-in",
                };

            if (band.kind === "caramel") {
              const top = band.y - 3;
              const zig = Array.from(
                { length: 9 },
                (_, i) => `${CX - c.top / 2 + 6 + i * ((c.top - 12) / 8)} ${top + (i % 2 ? 5 : -2)}`,
              );
              return (
                <path
                  key={band.kind}
                  d={`M${zig.join("L")}`}
                  fill="none"
                  stroke={fill}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray="1"
                  style={{
                    strokeDashoffset: on ? 0 : 1,
                    // Round caps still paint a dot on an undrawn line, so fade it out too.
                    opacity: on ? 1 : 0,
                    transition: still ? undefined : "stroke-dashoffset 1.2s ease-out, opacity .3s",
                  }}
                />
              );
            }

            return (
              <g
                key={band.kind}
                className="liquid"
                style={{ ...motion, transform: on ? "scaleY(1)" : "scaleY(0)" }}
              >
                <rect x="0" y={band.y} width={W} height={band.h + 0.5} fill={fill} />
                {band.kind === "foam" && (
                  <rect x="0" y={band.y} width={W} height={band.h} fill={`url(#${id}-bubbles)`} />
                )}
                {band.kind === "espresso" && (
                  <rect x="0" y={band.y} width={W} height={Math.min(5, band.h)} fill="#b9773f" />
                )}
                {band.kind === "kopi" && <rect x="0" y={band.y} width={W} height="4" fill="#7a4526" />}
                {band.kind === "water" && <rect x="0" y={band.y} width={W} height="2" fill="#b6d4e1" />}
              </g>
            );
          })}
        </g>

        {/* Walls, drawn over the liquid so its edges tuck in */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {glass ? (
            <>
              <path d={cupPath(c, false)} stroke="var(--color-glass)" strokeWidth="3.5" />
              <path
                d={`M${wallPoint(c, -1, 0.1).x + 9} ${wallPoint(c, -1, 0.1).y}L${wallPoint(c, -1, 0.72).x + 9} ${wallPoint(c, -1, 0.72).y}`}
                stroke="var(--color-glare)"
                strokeWidth="4"
              />
            </>
          ) : (
            <>
              <path d={cupPath(c, false)} stroke="var(--color-cup-line)" strokeWidth="11" />
              <path d={cupPath(c, false)} stroke="var(--color-ceramic)" strokeWidth="6" />
              {c.wall === "kopitiam" && (
                <path
                  d={cupPath(c, false)}
                  stroke="var(--color-cup-line)"
                  strokeWidth="11"
                  clipPath={`url(#${id}-rim)`}
                />
              )}
            </>
          )}
        </g>

        {steaming && (
          <g fill="none" stroke="var(--color-steam)" strokeWidth="3" strokeLinecap="round">
            {[-22, 0, 22].map((dx, i) => (
              <path
                key={dx}
                className="animate-steam"
                style={{
                  animationDelay: `${i * 0.45}s`,
                  transformBox: "fill-box",
                  transformOrigin: "50% 100%",
                }}
                d={`M${CX + dx} ${rim - 12}c-7 -8 7 -14 0 -22c-7 -8 7 -14 0 -22`}
              />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}

/** Words for screen readers: "Latte in a tall glass: espresso, steamed milk and foam, from the bottom up". */
export const describeCup = (recipe: Pick<Recipe, "name" | "cup" | "layers">, t: Dictionary, locale: Locale) =>
  t.recipe.describeCup(
    recipe.name[locale],
    t.recipe.cups[recipe.cup],
    joinList(
      t,
      recipe.layers.map((l) => t.recipe.layers[l.kind]),
    ),
  );
