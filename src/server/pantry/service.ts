import "server-only";

import { randomUUID } from "node:crypto";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n";
import { getIngredient } from "@/lib/coffee/ingredients";
import type { LogEntry, Pantry } from "@/lib/coffee/log";
import { getRecipe } from "@/lib/coffee/recipes";
import {
  brewSchema,
  countSchema,
  deliverySchema,
  fieldErrorsOf,
  type FieldErrors,
} from "@/lib/coffee/schema";
import { consume, cupsOf, formatAmount, formatPacks, shortfalls, usageFor } from "@/lib/coffee/stock";
import type { z } from "zod";
import { readPantry, updatePantry } from "./repository";

/**
 * Every change to stock goes through one of the three functions below. Both
 * the Server Actions and the REST API call them, so the rules live here only:
 *
 *  - brew:     making cups takes their ingredients off the shelf, all or nothing.
 *  - delivery: whole packs arrive and are added to the shelf.
 *  - count:    a physical count replaces what the shelf thought it had.
 *
 * Each change writes one entry to the bar log. Messages come back in `locale`.
 */

export type ChangeResult =
  | { ok: true; message: string; entry: LogEntry; pantry: Pantry }
  | { ok: false; kind: "validation" | "short"; message: string; fieldErrors: FieldErrors };

const LOG_LIMIT = 500;

/** The first problem is the message; every field keeps its own errors. */
function invalid(error: z.ZodError, t: Dictionary): ChangeResult {
  const fieldErrors = fieldErrorsOf(error, (key) => t.errors[key]);
  return {
    ok: false,
    kind: "validation",
    message: Object.values(fieldErrors).find((e) => e?.length)?.[0] ?? t.messages.checkField,
    fieldErrors,
  };
}

function save(current: Pantry, stock: Pantry["stock"], entry: LogEntry) {
  return { stock, log: [entry, ...current.log].slice(0, LOG_LIMIT) };
}

export async function logBrew(raw: unknown, locale: Locale = DEFAULT_LOCALE): Promise<ChangeResult> {
  const t = getDictionary(locale);
  const parsed = brewSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error, t);

  const { cups } = parsed.data;
  const recipe = getRecipe(parsed.data.recipe)!;

  return updatePantry<ChangeResult>((current) => {
    const short = shortfalls(recipe, cups, current.stock);
    if (short.length > 0) {
      const [first] = short;
      const { name, unit } = getIngredient(first.ingredient);
      const message = t.messages.short(
        name[locale].toLowerCase(),
        cupsOf(recipe, cups, locale),
        formatAmount(first.amount, unit),
        formatAmount(first.onShelf, unit),
      );
      return { next: null, result: { ok: false, kind: "short", message, fieldErrors: { cups: [message] } } };
    }

    const entry: LogEntry = {
      id: randomUUID(),
      at: new Date().toISOString(),
      kind: "brew",
      recipe: recipe.slug,
      cups,
      used: usageFor(recipe, cups),
    };
    const next = save(current, consume(current.stock, recipe, cups), entry);
    const message = t.messages.logged(cupsOf(recipe, cups, locale));
    return { next, result: { ok: true, message, entry, pantry: next } };
  });
}

export async function logDelivery(raw: unknown, locale: Locale = DEFAULT_LOCALE): Promise<ChangeResult> {
  const t = getDictionary(locale);
  const parsed = deliverySchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error, t);

  const { ingredient, packs } = parsed.data;
  const { name, pack } = getIngredient(ingredient);
  const amount = packs * pack.amount;

  return updatePantry<ChangeResult>((current) => {
    const entry: LogEntry = {
      id: randomUUID(),
      at: new Date().toISOString(),
      kind: "delivery",
      ingredient,
      packs,
      amount,
    };
    const stock = { ...current.stock, [ingredient]: current.stock[ingredient] + amount };
    const next = save(current, stock, entry);
    const message = t.messages.added(formatPacks(ingredient, packs, locale), name[locale].toLowerCase());
    return { next, result: { ok: true, message, entry, pantry: next } };
  });
}

export async function logCount(raw: unknown, locale: Locale = DEFAULT_LOCALE): Promise<ChangeResult> {
  const t = getDictionary(locale);
  const parsed = countSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error, t);

  const { ingredient, amount } = parsed.data;
  const { name, unit } = getIngredient(ingredient);

  return updatePantry<ChangeResult>((current) => {
    const expected = current.stock[ingredient];
    const entry: LogEntry = {
      id: randomUUID(),
      at: new Date().toISOString(),
      kind: "count",
      ingredient,
      counted: amount,
      expected,
    };
    const next = save(current, { ...current.stock, [ingredient]: amount }, entry);
    const message = t.messages.counted(formatAmount(amount, unit), name[locale].toLowerCase());
    return { next, result: { ok: true, message, entry, pantry: next } };
  });
}

export const getPantry = readPantry;
