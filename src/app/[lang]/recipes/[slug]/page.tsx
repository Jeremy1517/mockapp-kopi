import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrewForm } from "@/components/brew-form";
import { PourStage } from "@/components/pour-stage";
import type { Dictionary } from "@/i18n";
import { localePath, type Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getIngredient } from "@/lib/coffee/ingredients";
import { RECIPES, getRecipe, type Recipe } from "@/lib/coffee/recipes";
import { cupsLeft, formatAmount } from "@/lib/coffee/stock";
import { getStock } from "@/server/pantry/queries";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/recipes/[slug]">): Promise<Metadata> {
  const [{ slug }, { locale }] = await Promise.all([params, getI18n()]);
  const recipe = getRecipe(slug);
  return recipe ? { title: recipe.name[locale], description: recipe.blurb[locale] } : {};
}

export default async function RecipePage({ params }: PageProps<"/[lang]/recipes/[slug]">) {
  const { t } = await getI18n();
  // The slug is URL data: reading it behind Suspense keeps the shared page shell instant on navigation.
  return (
    <Suspense fallback={<RecipeSkeleton label={t.recipe.method} />}>
      <RecipeContent params={params} />
    </Suspense>
  );
}

async function RecipeContent({ params }: Pick<PageProps<"/[lang]/recipes/[slug]">, "params">) {
  const [{ slug }, { locale, t }] = await Promise.all([params, getI18n()]);
  const recipe = getRecipe(slug);
  if (!recipe) notFound();

  return (
    <PourStage
      recipe={recipe}
      header={
        <>
          <Link
            href={localePath(locale, "/recipes")}
            className="text-[15px] font-semibold text-jade underline decoration-jade/30 underline-offset-4 hover:decoration-jade"
          >
            {t.recipe.all}
          </Link>
          <h1 className="mt-4 font-sign text-5xl leading-[1.02] text-jade sm:text-6xl">
            {recipe.name[locale]}
          </h1>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-soft">{recipe.blurb[locale]}</p>
        </>
      }
      footer={
        <Suspense fallback={<div className="mt-12 h-48 rounded-2xl border-2 border-tile bg-mint" />}>
          <BrewPanel recipe={recipe} />
        </Suspense>
      }
    >
      <WhatGoesIn recipe={recipe} locale={locale} t={t} />
    </PourStage>
  );
}

function RecipeSkeleton({ label }: { label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
    >
      <div className="mx-auto aspect-[4/5] w-full max-w-[380px] rounded-[2rem] border-2 border-tile bg-mint" />
      <div className="space-y-4">
        <div className="h-5 w-24 rounded bg-mint" />
        <div className="h-14 w-2/3 rounded bg-mint" />
        <div className="h-20 rounded bg-mint" />
      </div>
    </div>
  );
}

function WhatGoesIn({ recipe, locale, t }: { recipe: Recipe; locale: Locale; t: Dictionary }) {
  return (
    <section aria-labelledby="ingredients-title">
      <h2 id="ingredients-title" className="font-sign text-2xl text-jade">
        {t.recipe.whatGoesIn}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">{t.recipe.perCup}</p>
      <ul className="mt-4 max-w-md">
        {recipe.uses.map(({ ingredient, amount }) => {
          const { name, unit, color } = getIngredient(ingredient);
          return (
            <li
              key={ingredient}
              className="flex items-baseline gap-3 border-b-2 border-dotted border-tile py-2.5"
            >
              <span
                className="size-3.5 shrink-0 translate-y-0.5 rounded-full ring-2 ring-jade/20"
                style={{ background: color }}
                aria-hidden="true"
              />
              <Link
                href={`${localePath(locale, "/")}?item=${ingredient}`}
                className="font-medium hover:text-jade hover:underline"
              >
                {name[locale]}
              </Link>
              <span className="ml-auto font-semibold whitespace-nowrap">{formatAmount(amount, unit)}</span>
            </li>
          );
        })}
        {recipe.untracked?.map(({ name, amount }) => (
          <li
            key={name.en}
            className="flex items-baseline gap-3 border-b-2 border-dotted border-tile py-2.5 text-ink-soft"
          >
            <span
              className="size-3.5 shrink-0 translate-y-0.5 rounded-full border-2 border-dashed border-jade/40"
              aria-hidden="true"
            />
            <span>
              {name[locale]} <span className="text-sm">{t.recipe.fromTap}</span>
            </span>
            <span className="ml-auto font-semibold whitespace-nowrap">{amount}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function BrewPanel({ recipe }: { recipe: Recipe }) {
  const { cups, limitedBy } = cupsLeft(recipe, await getStock());
  return <BrewForm slug={recipe.slug} cupsLeft={cups} limitedBy={limitedBy} />;
}
