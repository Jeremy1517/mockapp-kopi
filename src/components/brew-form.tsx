"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { brewAction, type ActionState } from "@/app/actions";
import { capitalize } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { getIngredient, type IngredientId } from "@/lib/coffee/ingredients";
import { getRecipe } from "@/lib/coffee/recipes";
import { MAX_CUPS_PER_LOG } from "@/lib/coffee/schema";
import { cupsOf } from "@/lib/coffee/stock";
import { Stepper } from "./stepper";
import { Notice, buttonClass } from "./ui";

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
  const { locale, t, href } = useI18n();
  const recipe = getRecipe(slug)!;
  const [state, action, pending] = useActionState(brewAction, idle);
  const [wanted, setWanted] = useState(1);
  const max = Math.max(1, Math.min(cupsLeft, MAX_CUPS_PER_LOG));
  const cups = Math.min(wanted, max);
  const limiting = getIngredient(limitedBy).name[locale].toLowerCase();

  return (
    <section
      aria-labelledby="brew-title"
      className="mt-12 rounded-2xl border-2 border-tile bg-porcelain p-5 sm:p-7"
    >
      <h2 id="brew-title" className="font-sign text-2xl text-jade">
        {t.brew.title}
      </h2>
      {cupsLeft === 0 ? (
        <p className="mt-2 font-medium text-chili">
          {t.brew.cantMake(recipe.count.one[locale], limiting)}{" "}
          <Link href={`${href("/")}?item=${limitedBy}`} className="underline underline-offset-2">
            {t.brew.logDelivery}
          </Link>
        </p>
      ) : (
        <p className="mt-2 text-ink-soft">
          {t.brew.enoughLead} <strong className="font-semibold text-ink">{t.brew.more(cupsLeft)}</strong>.{" "}
          {t.brew.runsOutFirst(capitalize(limiting))}
        </p>
      )}

      <form action={action} className="mt-5 flex flex-wrap items-end gap-3">
        <input type="hidden" name="recipe" value={slug} />
        <input type="hidden" name="locale" value={locale} />
        <Stepper
          id="brew-cups"
          name="cups"
          label={t.brew.cupsMade}
          value={cups}
          onChange={setWanted}
          min={1}
          max={max}
          invalid={state.status === "error"}
          describedBy={state.message ? "brew-result" : undefined}
        />
        <button type="submit" disabled={pending || cupsLeft === 0} className={buttonClass()}>
          {pending ? t.brew.logging : t.brew.log(cupsOf(recipe, cups, locale))}
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
