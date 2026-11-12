import type { Localized } from "@/i18n/config";

/**
 * Everything the shelf holds. Only ingredients that at least one recipe uses
 * belong here (enforced by catalog.test.ts) — no cups, lids or pastries.
 *
 * Amounts are always in the base unit: grams or millilitres.
 */

export const INGREDIENT_IDS = [
  "espresso-beans",
  "fresh-milk",
  "chocolate-sauce",
  "vanilla-syrup",
  "caramel-sauce",
  "kopi-powder",
  "condensed-milk",
] as const;

export type IngredientId = (typeof INGREDIENT_IDS)[number];
export type Unit = "g" | "ml";
export type Vessel = "bag" | "carton" | "bottle" | "jar" | "tin";

export interface Ingredient {
  id: IngredientId;
  name: Localized;
  unit: Unit;
  /** How it's drawn on the shelf. */
  vessel: Vessel;
  /** Colour of the ingredient itself. */
  color: string;
  /** What a full shelf holds; sets how full the drawing looks. */
  shelfCapacity: number;
  /** Reorder once stock drops below this. */
  reorderAt: number;
  /** What one unit of a delivery contains, e.g. a 1 kg bag. */
  pack: { amount: number; one: Localized; other: Localized };
  /** Stock on a brand-new shelf. */
  opening: number;
}

export const INGREDIENTS: readonly Ingredient[] = [
  {
    id: "espresso-beans",
    name: { en: "Espresso beans", manglish: "Espresso beans" },
    unit: "g",
    vessel: "bag",
    color: "#5b3421",
    shelfCapacity: 6000,
    reorderAt: 2000,
    pack: { amount: 1000, one: { en: "bag", manglish: "bag" }, other: { en: "bags", manglish: "bag" } },
    opening: 3400,
  },
  {
    id: "fresh-milk",
    name: { en: "Fresh milk", manglish: "Susu segar" },
    unit: "ml",
    vessel: "carton",
    color: "#fffdf6",
    shelfCapacity: 24000,
    reorderAt: 8000,
    pack: {
      amount: 2000,
      one: { en: "bottle", manglish: "botol" },
      other: { en: "bottles", manglish: "botol" },
    },
    opening: 9600,
  },
  {
    id: "chocolate-sauce",
    name: { en: "Chocolate sauce", manglish: "Choc sauce" },
    unit: "g",
    vessel: "bottle",
    color: "#3d1d12",
    shelfCapacity: 2000,
    reorderAt: 600,
    pack: {
      amount: 1000,
      one: { en: "bottle", manglish: "botol" },
      other: { en: "bottles", manglish: "botol" },
    },
    opening: 1350,
  },
  {
    id: "vanilla-syrup",
    name: { en: "Vanilla syrup", manglish: "Vanilla syrup" },
    unit: "ml",
    vessel: "bottle",
    color: "#e6c06f",
    shelfCapacity: 1500,
    reorderAt: 500,
    pack: {
      amount: 750,
      one: { en: "bottle", manglish: "botol" },
      other: { en: "bottles", manglish: "botol" },
    },
    opening: 320,
  },
  {
    id: "caramel-sauce",
    name: { en: "Caramel sauce", manglish: "Caramel sauce" },
    unit: "g",
    vessel: "bottle",
    color: "#b66d28",
    shelfCapacity: 2000,
    reorderAt: 500,
    pack: {
      amount: 1000,
      one: { en: "bottle", manglish: "botol" },
      other: { en: "bottles", manglish: "botol" },
    },
    opening: 900,
  },
  {
    id: "kopi-powder",
    name: { en: "Kopi powder", manglish: "Kopi powder" },
    unit: "g",
    vessel: "jar",
    color: "#2f1a0f",
    shelfCapacity: 4000,
    reorderAt: 1000,
    pack: { amount: 1000, one: { en: "pack", manglish: "pack" }, other: { en: "packs", manglish: "pack" } },
    opening: 2600,
  },
  {
    id: "condensed-milk",
    name: { en: "Condensed milk", manglish: "Susu pekat" },
    unit: "g",
    vessel: "tin",
    color: "#f2dca0",
    shelfCapacity: 4000,
    reorderAt: 1200,
    pack: { amount: 500, one: { en: "tin", manglish: "tin" }, other: { en: "tins", manglish: "tin" } },
    opening: 1300,
  },
];

const byId = new Map(INGREDIENTS.map((i) => [i.id, i]));

export function getIngredient(id: IngredientId): Ingredient {
  const ingredient = byId.get(id);
  if (!ingredient) throw new Error(`Unknown ingredient: ${id}`);
  return ingredient;
}

export const isIngredientId = (value: unknown): value is IngredientId =>
  typeof value === "string" && byId.has(value as IngredientId);
