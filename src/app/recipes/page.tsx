import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CupDrawing } from "@/components/cup-drawing";
import { PageTitle, cx } from "@/components/ui";
import { getIngredient } from "@/lib/coffee/ingredients";
import { RECIPES, type Recipe } from "@/lib/coffee/recipes";
import { cupsLeft, formatAmount } from "@/lib/coffee/stock";
import { getStock } from "@/server/pantry/queries";

export const metadata: Metadata = { title: "Recipes" };

export default function RecipesPage() {
  return (
    <>
      <PageTitle title="Recipes">
        <p>
          Every drink on the menu, measured per cup so each one comes out the same. Open a recipe to watch it
          come together step by step.
        </p>
      </PageTitle>

      <ul className="max-w-4xl">
        {RECIPES.map((recipe) => (
          <li key={recipe.slug} className="border-b-2 border-dotted border-tile first:border-t-2">
            <Link
              href={`/recipes/${recipe.slug}`}
              className="group grid grid-cols-[4.5rem_1fr] items-center gap-x-5 gap-y-2 rounded-lg py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade sm:grid-cols-[6rem_1fr_auto] sm:gap-x-8"
            >
              <CupDrawing recipe={recipe} still className="row-span-2 w-full sm:row-span-1" />
              <div className="min-w-0">
                <h2 className="font-sign text-2xl leading-tight text-jade sm:text-[1.75rem]">
                  {recipe.name}
                </h2>
                <p className="mt-1.5 max-w-[60ch] text-ink-soft">{recipe.blurb}</p>
                <p className="mt-2 text-sm font-medium">{ingredientLine(recipe)}</p>
              </div>
              <div className="sm:text-right">
                <Suspense fallback={<span className="text-sm text-ink-soft">Checking the shelf…</span>}>
                  <CupsLeft recipe={recipe} />
                </Suspense>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function ingredientLine(recipe: Recipe) {
  return recipe.uses
    .map((u) => {
      const { name, unit } = getIngredient(u.ingredient);
      return `${formatAmount(u.amount, unit)} ${name.toLowerCase()}`;
    })
    .join(", ");
}

async function CupsLeft({ recipe }: { recipe: Recipe }) {
  const { cups } = cupsLeft(recipe, await getStock());
  return (
    <p className={cx("text-sm font-semibold", cups < 10 ? "text-chili" : "text-ink-soft")}>
      {cups === 0 ? "Can't make any right now" : `${cups} ${cups === 1 ? "cup" : "cups"} left on the shelf`}
    </p>
  );
}
