import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CupDrawing } from "@/components/cup-drawing";
import { PageTitle, cx } from "@/components/ui";
import { localePath, type Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getIngredient } from "@/lib/coffee/ingredients";
import { RECIPES, type Recipe } from "@/lib/coffee/recipes";
import { cupsLeft, formatAmount } from "@/lib/coffee/stock";
import { getStock } from "@/server/pantry/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.recipes.title };
}

export default async function RecipesPage() {
  const { locale, t } = await getI18n();
  return (
    <>
      <PageTitle title={t.recipes.title}>
        <p>{t.recipes.intro}</p>
      </PageTitle>

      <ul className="max-w-4xl">
        {RECIPES.map((recipe) => (
          <li key={recipe.slug} className="border-b-2 border-dotted border-tile first:border-t-2">
            <Link
              href={localePath(locale, `/recipes/${recipe.slug}`)}
              className="group grid grid-cols-[4.5rem_1fr] items-center gap-x-5 gap-y-2 rounded-lg py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade sm:grid-cols-[6rem_1fr_auto] sm:gap-x-8"
            >
              <CupDrawing recipe={recipe} still className="row-span-2 w-full sm:row-span-1" />
              <div className="min-w-0">
                <h2 className="font-sign text-2xl leading-tight text-jade sm:text-[1.75rem]">
                  {recipe.name[locale]}
                </h2>
                <p className="mt-1.5 max-w-[60ch] text-ink-soft">{recipe.blurb[locale]}</p>
                <p className="mt-2 text-sm font-medium">{ingredientLine(recipe, locale)}</p>
              </div>
              <div className="sm:text-right">
                <Suspense fallback={<span className="text-sm text-ink-soft">{t.recipes.checking}</span>}>
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

function ingredientLine(recipe: Recipe, locale: Locale) {
  return recipe.uses
    .map((u) => {
      const { name, unit } = getIngredient(u.ingredient);
      return `${formatAmount(u.amount, unit)} ${name[locale].toLowerCase()}`;
    })
    .join(", ");
}

async function CupsLeft({ recipe }: { recipe: Recipe }) {
  const [stock, { t }] = await Promise.all([getStock(), getI18n()]);
  const { cups } = cupsLeft(recipe, stock);
  return (
    <p className={cx("text-sm font-semibold", cups < 10 ? "text-chili" : "text-ink-soft")}>
      {cups === 0 ? t.recipes.none : t.recipes.left(cups)}
    </p>
  );
}
