import { INGREDIENTS, getIngredient, type IngredientId, type Unit } from "./ingredients";
import type { Recipe } from "./recipes";

/**
 * Pure stock arithmetic — no I/O. Shared by the server (which owns the real
 * numbers) and the browser (which only displays them).
 */

export type Stock = Record<IngredientId, number>;
export type Usage = { ingredient: IngredientId; amount: number };
export type Level = "out" | "low" | "ok";

export const openingStock = (): Stock =>
  Object.fromEntries(INGREDIENTS.map((i) => [i.id, i.opening])) as Stock;

/** Ingredients taken from the shelf for `cups` of a recipe. */
export const usageFor = (recipe: Recipe, cups: number): Usage[] =>
  recipe.uses.map((u) => ({ ingredient: u.ingredient, amount: u.amount * cups }));

/** How many cups the shelf can still make, and which ingredient runs out first. */
export function cupsLeft(recipe: Recipe, stock: Stock): { cups: number; limitedBy: IngredientId } {
  let best: { cups: number; limitedBy: IngredientId } | null = null;
  for (const { ingredient, amount } of recipe.uses) {
    const cups = Math.floor(Math.max(0, stock[ingredient]) / amount);
    if (best === null || cups < best.cups) best = { cups, limitedBy: ingredient };
  }
  if (!best) throw new Error(`${recipe.slug} uses nothing from the shelf`);
  return best;
}

/** Ingredients the shelf doesn't have enough of for `cups` of a recipe. */
export const shortfalls = (recipe: Recipe, cups: number, stock: Stock) =>
  usageFor(recipe, cups)
    .filter((u) => stock[u.ingredient] < u.amount)
    .map((u) => ({ ...u, onShelf: stock[u.ingredient] }));

/** New stock after making `cups`. Throws if any ingredient would go negative. */
export function consume(stock: Stock, recipe: Recipe, cups: number): Stock {
  if (shortfalls(recipe, cups, stock).length > 0) {
    throw new Error(`Not enough stock for ${cups} × ${recipe.slug}`);
  }
  const next = { ...stock };
  for (const u of usageFor(recipe, cups)) next[u.ingredient] = round(next[u.ingredient] - u.amount);
  return next;
}

export function levelOf(id: IngredientId, amount: number): Level {
  if (amount <= 0) return "out";
  return amount < getIngredient(id).reorderAt ? "low" : "ok";
}

/** 0–1, for drawing how full the container looks. */
export const fillOf = (id: IngredientId, amount: number) =>
  Math.min(1, Math.max(0, amount / getIngredient(id).shelfCapacity));

/** 3400 g → "3.4 kg", 320 ml → "320 ml". */
export function formatAmount(amount: number, unit: Unit): string {
  if (Math.abs(amount) >= 1000) {
    const big = (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : amount % 100 === 0 ? 1 : 2);
    return `${big} ${unit === "g" ? "kg" : "L"}`;
  }
  return `${round(amount)} ${unit}`;
}

/** "1 bag", "3 bags". */
export const formatPacks = (id: IngredientId, packs: number) => {
  const { pack } = getIngredient(id);
  return `${packs} ${packs === 1 ? pack.one : pack.other}`;
};

/** "1 latte", "3 lattes". */
export const cupsOf = (recipe: Recipe, cups: number) =>
  `${cups} ${cups === 1 ? recipe.count.one : recipe.count.other}`;

const round = (n: number) => Math.round(n * 100) / 100;
