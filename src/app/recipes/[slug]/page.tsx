import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrewForm } from "@/components/brew-form";
import { PourStage } from "@/components/pour-stage";
import { getIngredient } from "@/lib/coffee/ingredients";
import { RECIPES, getRecipe, type Recipe } from "@/lib/coffee/recipes";
import { cupsLeft, formatAmount } from "@/lib/coffee/stock";
import { getStock } from "@/server/pantry/queries";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/recipes/[slug]">): Promise<Metadata> {
  const recipe = getRecipe((await params).slug);
  return recipe ? { title: recipe.name, description: recipe.blurb } : {};
}

export default async function RecipePage({ params }: PageProps<"/recipes/[slug]">) {
  const recipe = getRecipe((await params).slug);
  if (!recipe) notFound();

  return (
    <PourStage
      recipe={recipe}
      header={
        <>
          <Link
            href="/recipes"
            className="text-[15px] font-semibold text-jade underline decoration-jade/30 underline-offset-4 hover:decoration-jade"
          >
            All recipes
          </Link>
          <h1 className="mt-4 font-sign text-5xl leading-[1.02] text-jade sm:text-6xl">{recipe.name}</h1>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-soft">{recipe.blurb}</p>
        </>
      }
      footer={
        <Suspense fallback={<div className="mt-12 h-48 rounded-2xl border-2 border-tile bg-mint" />}>
          <BrewPanel recipe={recipe} />
        </Suspense>
      }
    >
      <WhatGoesIn recipe={recipe} />
    </PourStage>
  );
}

function WhatGoesIn({ recipe }: { recipe: Recipe }) {
  return (
    <section aria-labelledby="ingredients-title">
      <h2 id="ingredients-title" className="font-sign text-2xl text-jade">
        What goes in
      </h2>
      <p className="mt-1 text-sm text-ink-soft">Per cup.</p>
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
              <Link href={`/?item=${ingredient}`} className="font-medium hover:text-jade hover:underline">
                {name}
              </Link>
              <span className="ml-auto font-semibold">{formatAmount(amount, unit)}</span>
            </li>
          );
        })}
        {recipe.untracked?.map(({ name, amount }) => (
          <li
            key={name}
            className="flex items-baseline gap-3 border-b-2 border-dotted border-tile py-2.5 text-ink-soft"
          >
            <span
              className="size-3.5 shrink-0 translate-y-0.5 rounded-full border-2 border-dashed border-jade/40"
              aria-hidden="true"
            />
            <span>
              {name} <span className="text-sm">(from the tap, not kept on the shelf)</span>
            </span>
            <span className="ml-auto font-semibold">{amount}</span>
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
