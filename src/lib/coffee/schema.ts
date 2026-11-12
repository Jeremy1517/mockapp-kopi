import { z } from "zod";
import { INGREDIENT_IDS } from "./ingredients";
import { MAX_COUNT, MAX_CUPS_PER_LOG, MAX_PACKS_PER_DELIVERY } from "./limits";
import { RECIPES } from "./recipes";

export { MAX_COUNT, MAX_CUPS_PER_LOG, MAX_PACKS_PER_DELIVERY };

/**
 * Inputs for the three ways stock changes. Form fields arrive as strings, so
 * numbers are coerced. Error messages are keys into the dictionary's `errors`,
 * so each language words them its own way.
 */

export type ErrorKey =
  | "pickDrink"
  | "cupsMissing"
  | "cupsWhole"
  | "cupsMin"
  | "cupsMax"
  | "pickIngredient"
  | "packsMissing"
  | "packsWhole"
  | "packsMin"
  | "packsMax"
  | "amountMissing"
  | "amountMin"
  | "amountMax";

const key = (k: ErrorKey) => k;

const slugs = RECIPES.map((r) => r.slug) as [string, ...string[]];

/** A blank form field means "missing", not 0. */
const blankAsMissing = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const brewSchema = z.object({
  recipe: z.enum(slugs, { error: key("pickDrink") }),
  cups: z.preprocess(
    blankAsMissing,
    z.coerce
      .number({ error: key("cupsMissing") })
      .int(key("cupsWhole"))
      .min(1, key("cupsMin"))
      .max(MAX_CUPS_PER_LOG, key("cupsMax")),
  ),
});

export const deliverySchema = z.object({
  ingredient: z.enum(INGREDIENT_IDS, { error: key("pickIngredient") }),
  packs: z.preprocess(
    blankAsMissing,
    z.coerce
      .number({ error: key("packsMissing") })
      .int(key("packsWhole"))
      .min(1, key("packsMin"))
      .max(MAX_PACKS_PER_DELIVERY, key("packsMax")),
  ),
});

export const countSchema = z.object({
  ingredient: z.enum(INGREDIENT_IDS, { error: key("pickIngredient") }),
  amount: z.preprocess(
    blankAsMissing,
    z.coerce
      .number({ error: key("amountMissing") })
      .min(0, key("amountMin"))
      .max(MAX_COUNT, key("amountMax")),
  ),
});

export type BrewInput = z.infer<typeof brewSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type CountInput = z.infer<typeof countSchema>;
export type FieldErrors = Record<string, string[] | undefined>;

/** Field errors, worded by `translate` (which receives each error key). */
export function fieldErrorsOf(error: z.ZodError, translate: (key: ErrorKey) => string): FieldErrors {
  const raw = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(
    Object.entries(raw).map(([field, keys]) => [field, keys?.map((k) => translate(k as ErrorKey))]),
  );
}
