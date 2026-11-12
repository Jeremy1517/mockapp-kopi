"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { brewAction, type ActionState } from "@/app/actions";
import { getIngredient, type IngredientId } from "@/lib/coffee/ingredients";
import { getRecipe } from "@/lib/coffee/recipes";
import { MAX_CUPS_PER_LOG } from "@/lib/coffee/schema";
import { cupsOf } from "@/lib/coffee/stock";
import { Stepper } from "./stepper";
import { Notice, buttonClass, cx } from "./ui";

const idle: ActionState = { status: "idle", seq: 0 };

export function BrewForm({
  slug,
  cupsLeft,
  limitedBy,
}: {
  slug: string;
  cupsLeft: number;
  limitedBy: IngredientId;
}) {
  const recipe = getRecipe(slug)!;
  const [state, action, pending] = useActionState(brewAction, idle);
  const [wanted, setWanted] = useState(1);
  const max = Math.max(1, Math.min(cupsLeft, MAX_CUPS_PER_LOG));
  const cups = Math.min(wanted, max);
  const limiting = getIngredient(limitedBy).name.toLowerCase();

  return (
    <section
      aria-labelledby="brew-title"
      className="mt-12 rounded-2xl border-2 border-tile bg-porcelain p-5 sm:p-7"
    >
      <h2 id="brew-title" className="font-sign text-2xl text-jade">
        Log cups made
      </h2>
      {cupsLeft === 0 ? (
        <p className="mt-2 font-medium text-chili">
          The shelf can&apos;t make another {recipe.count.one}: {limiting} has run out.{" "}
          <Link href={`/?item=${limitedBy}`} className="underline underline-offset-2">
            Log a delivery
          </Link>
        </p>
      ) : (
        <p className="mt-2 text-ink-soft">
          The shelf has enough for <strong className="font-semibold text-ink">{cupsLeft} more</strong>.{" "}
          {limiting[0].toUpperCase() + limiting.slice(1)} runs out first. Logging takes the ingredients off
          the shelf.
        </p>
      )}

      <form action={action} className="mt-5 flex flex-wrap items-end gap-3">
        <input type="hidden" name="recipe" value={slug} />
        <Stepper
          id="brew-cups"
          name="cups"
          label="Cups made"
          value={cups}
          onChange={setWanted}
          min={1}
          max={max}
          invalid={state.status === "error"}
          describedBy={state.message ? "brew-result" : undefined}
        />
        <button type="submit" disabled={pending || cupsLeft === 0} className={cx(buttonClass())}>
          {pending ? "Logging…" : `Log ${cupsOf(recipe, cups)}`}
        </button>
      </form>
      {state.message && (
        <Notice key={state.seq} id="brew-result" tone={state.status === "error" ? "error" : "done"}>
          {state.message}
        </Notice>
      )}
    </section>
  );
}
