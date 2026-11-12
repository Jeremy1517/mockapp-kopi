import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "@/lib/coffee/ingredients";
import { RECIPES } from "@/lib/coffee/recipes";
import { cupsOf, formatPacks } from "@/lib/coffee/stock";
import { getDictionary, joinList } from ".";
import { LOCALES, localePath, splitLocale, toLocale } from "./config";

describe("locale paths", () => {
  it("prefixes and splits paths", () => {
    expect(localePath("manglish", "/recipes/latte")).toBe("/manglish/recipes/latte");
    expect(localePath("en", "/")).toBe("/en");
    expect(splitLocale("/manglish/recipes/latte")).toEqual({ locale: "manglish", path: "/recipes/latte" });
    expect(splitLocale("/en")).toEqual({ locale: "en", path: "/" });
    expect(splitLocale("/recipes")).toEqual({ locale: null, path: "/recipes" });
  });

  it("falls back to English for anything unknown", () => {
    expect(toLocale("manglish")).toBe("manglish");
    expect(toLocale("fr")).toBe("en");
    expect(toLocale(null)).toBe("en");
  });
});

describe("catalogue text", () => {
  it("has every ingredient and recipe written in every language", () => {
    const texts = [
      ...INGREDIENTS.flatMap((i) => [i.name, i.pack.one, i.pack.other]),
      ...RECIPES.flatMap((r) => [
        r.name,
        r.blurb,
        r.count.one,
        r.count.other,
        ...r.steps.map((s) => s.text),
        ...(r.untracked ?? []).map((u) => u.name),
      ]),
    ];
    for (const text of texts) {
      for (const locale of LOCALES) expect(text[locale]?.trim(), JSON.stringify(text)).toBeTruthy();
    }
  });

  it("counts cups and packs the way each language does", () => {
    const latte = RECIPES.find((r) => r.slug === "latte")!;
    expect(cupsOf(latte, 3, "en")).toBe("3 lattes");
    expect(cupsOf(latte, 3, "manglish")).toBe("3 latte");
    expect(formatPacks("fresh-milk", 2, "en")).toBe("2 bottles");
    expect(formatPacks("fresh-milk", 2, "manglish")).toBe("2 botol");
  });
});

describe("dictionaries", () => {
  it("join lists with each language's 'and'", () => {
    expect(joinList(getDictionary("en"), ["a", "b", "c"])).toBe("a, b and c");
    expect(joinList(getDictionary("en"), ["a"])).toBe("a");
  });

  it("word every validation error in every language", () => {
    const keys = Object.keys(getDictionary("en").errors).sort();
    for (const locale of LOCALES) {
      const errors = getDictionary(locale).errors;
      expect(Object.keys(errors).sort()).toEqual(keys);
      for (const message of Object.values(errors)) expect(message.trim()).not.toBe("");
    }
  });
});
