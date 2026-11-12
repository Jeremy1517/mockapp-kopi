"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { LayerKind, Recipe } from "@/lib/coffee/recipes";
import { CupDrawing, describeCup } from "./cup-drawing";
import { buttonClass, cx } from "./ui";

/** Time each step stays highlighted while the recipe plays itself through. */
const POUR_MS = 1700;
const STEP_MS = 1100;
const START_MS = 600;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );

/**
 * The recipe's method next to its cup. On load the steps play through once and
 * each pour fills the cup; tap a step to jump to it, or pour again from empty.
 */
export function PourStage({
  recipe,
  header,
  children,
  footer,
}: {
  recipe: Recipe;
  header: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const { steps } = recipe;
  const reduced = useReducedMotion();
  const [step, setStep] = useState(-1); // -1: empty cup; steps.length: served
  const [playing, setPlaying] = useState(true);
  const [run, setRun] = useState(0);

  // With reduced motion the cup starts full and nothing plays by itself.
  const current = reduced && playing ? steps.length : step;
  const done = current >= steps.length;

  useEffect(() => {
    if (!playing || reduced || step >= steps.length) return;
    const delay = step < 0 ? START_MS : steps[step].adds ? POUR_MS : STEP_MS;
    const timer = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, reduced, step, steps, run]);

  const poured = useMemo(() => {
    const kinds = new Set<LayerKind>();
    steps.forEach((s, i) => {
      if (s.adds && i <= current) kinds.add(s.adds);
    });
    return kinds;
  }, [steps, current]);

  const pouring = !done && current >= 0 ? (steps[current].adds ?? null) : null;

  function pourAgain() {
    setStep(-1);
    setPlaying(true);
    setRun((r) => r + 1);
  }

  function jumpTo(i: number) {
    setPlaying(false);
    setStep(i);
  }

  return (
    <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="lg:col-start-2">{header}</div>

      <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <div className="lg:sticky lg:top-8">
          <div className="mx-auto max-w-[320px] overflow-hidden sm:max-w-[380px] rounded-[2rem] border-2 border-tile bg-mint px-4 pt-4">
            <CupDrawing
              recipe={recipe}
              poured={poured}
              pouring={pouring}
              pourKey={`${run}-${current}`}
              steaming={done && !reduced}
              counter
              title={describeCup(recipe)}
              className="mx-auto block w-full"
            />
          </div>
          <div className="mx-auto mt-4 flex max-w-[320px] sm:max-w-[380px] items-center justify-between gap-4">
            <p className="text-sm text-ink-soft" aria-live="off">
              {done
                ? "Ready to serve"
                : current < 0
                  ? "Getting the cup ready"
                  : `Step ${current + 1} of ${steps.length}`}
            </p>
            <button type="button" onClick={pourAgain} className={buttonClass("quiet")}>
              {reduced ? "Start from step 1" : "Pour again"}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-start-2">
        {children}

        <section aria-labelledby="method-title" className="mt-12">
          <h2 id="method-title" className="font-sign text-2xl text-jade">
            Method
          </h2>
          <ol className="mt-4 space-y-1.5">
            {steps.map((s, i) => {
              const state = i === current ? "now" : i < current ? "done" : "next";
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={state === "now" ? "step" : undefined}
                    className={cx(
                      "flex w-full items-start gap-4 rounded-xl px-3 py-3 text-left transition-colors duration-300",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade",
                      state === "now" ? "bg-kaya-soft" : "hover:bg-porcelain",
                    )}
                  >
                    <span
                      className={cx(
                        "flex size-7 shrink-0 items-center justify-center rounded-full font-sign text-base transition-colors duration-300",
                        state === "now"
                          ? "bg-kaya text-ink"
                          : state === "done"
                            ? "text-jade"
                            : "text-ink-soft",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className={cx("leading-7", state === "done" ? "text-ink-soft" : "text-ink")}>
                      {s.text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        {footer}
      </div>
    </div>
  );
}
