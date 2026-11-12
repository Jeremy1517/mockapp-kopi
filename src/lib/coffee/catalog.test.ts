import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "./ingredients";
import { RECIPES, recipesUsing } from "./recipes";

describe("ingredient catalogue", () => {
  it("only stocks ingredients that a recipe needs", () => {
    for (const ingredient of INGREDIENTS) {
      expect(recipesUsing(ingredient.id), `${ingredient.id} is not used by any recipe`).not.toHaveLength(0);
    }
  });

  it("has sensible shelf numbers", () => {
    for (const i of INGREDIENTS) {
      expect(i.reorderAt).toBeGreaterThan(0);
      expect(i.reorderAt).toBeLessThan(i.shelfCapacity);
      expect(i.pack.amount).toBeGreaterThan(0);
      expect(i.opening).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("recipes", () => {
  it("have unique slugs", () => {
    const slugs = RECIPES.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("use each shelf ingredient at most once and in positive amounts", () => {
    for (const r of RECIPES) {
      const ids = r.uses.map((u) => u.ingredient);
      expect(new Set(ids).size, r.slug).toBe(ids.length);
      for (const u of r.uses) expect(u.amount, `${r.slug}/${u.ingredient}`).toBeGreaterThan(0);
    }
  });

  it("pour every layer in the drawing exactly once, from a step", () => {
    for (const r of RECIPES) {
      const layers = r.layers.map((l) => l.kind);
      const poured = r.steps.flatMap((s) => (s.adds ? [s.adds] : []));
      expect(new Set(layers).size, `${r.slug} repeats a layer`).toBe(layers.length);
      expect([...poured].sort(), r.slug).toEqual([...layers].sort());
    }
  });
});
