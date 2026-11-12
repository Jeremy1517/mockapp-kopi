import type { Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { manglish } from "./dictionaries/manglish";

export type { Dictionary };

// Both dictionaries are small and used on both sides, so they're plain imports.
const dictionaries: Record<Locale, Dictionary> = { en, manglish };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

/** "A", "A and B", "A, B and C". */
export const joinList = (t: Dictionary, items: string[]) =>
  items.length > 1 ? `${items.slice(0, -1).join(", ")} ${t.and} ${items.at(-1)}` : (items[0] ?? "");

export const capitalize = (text: string) => (text ? `${text[0].toUpperCase()}${text.slice(1)}` : text);
