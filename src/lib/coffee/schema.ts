import { z } from "zod";
import { INGREDIENT_IDS } from "./ingredients";
import { RECIPES } from "./recipes";

/** Inputs for the three ways stock changes. Form fields arrive as strings, so numbers are coerced. */

const slugs = RECIPES.map((r) => r.slug) as [string, ...string[]];

/** A blank form field means "missing", not 0. */
const blankAsMissing = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const MAX_CUPS_PER_LOG = 50;
export const MAX_PACKS_PER_DELIVERY = 50;
export const MAX_COUNT = 100_000;

export const brewSchema = z.object({
  recipe: z.enum(slugs, { error: "Pick a drink from the menu." }),
  cups: z.preprocess(
    blankAsMissing,
    z.coerce
      .number({ error: "Enter how many cups you made." })
      .int("Cups must be a whole number.")
      .min(1, "Log at least 1 cup.")
      .max(MAX_CUPS_PER_LOG, `Log at most ${MAX_CUPS_PER_LOG} cups at a time.`),
  ),
});

export const deliverySchema = z.object({
  ingredient: z.enum(INGREDIENT_IDS, { error: "Pick an ingredient from the shelf." }),
  packs: z.preprocess(
    blankAsMissing,
    z.coerce
      .number({ error: "Enter how many arrived." })
      .int("Use a whole number.")
      .min(1, "Add at least 1.")
      .max(MAX_PACKS_PER_DELIVERY, `Add at most ${MAX_PACKS_PER_DELIVERY} at a time.`),
  ),
});

export const countSchema = z.object({
  ingredient: z.enum(INGREDIENT_IDS, { error: "Pick an ingredient from the shelf." }),
  amount: z.preprocess(
    blankAsMissing,
    z.coerce
      .number({ error: "Enter the amount you counted." })
      .min(0, "The amount can't be below zero.")
      .max(MAX_COUNT, `That's more than one shelf holds. Enter ${MAX_COUNT} or less.`),
  ),
});

export type BrewInput = z.infer<typeof brewSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type CountInput = z.infer<typeof countSchema>;
export type FieldErrors = Record<string, string[] | undefined>;

export const fieldErrorsOf = (error: z.ZodError): FieldErrors =>
  z.flattenError(error).fieldErrors as FieldErrors;
