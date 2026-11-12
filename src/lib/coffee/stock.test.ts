import { describe, expect, it } from "vitest";
import { getRecipe } from "./recipes";
import {
  consume,
  cupsLeft,
  cupsOf,
  fillOf,
  formatAmount,
  formatPacks,
  levelOf,
  openingStock,
  shortfalls,
  usageFor,
  type Stock,
} from "./stock";

const latte = getRecipe("latte")!;
const mocha = getRecipe("mocha")!;

const stock = (overrides: Partial<Stock>): Stock => ({ ...openingStock(), ...overrides });

describe("cupsLeft", () => {
  it("is limited by whichever ingredient runs out first", () => {
    // 1000 g beans → 55 shots; 2200 ml milk → 10 lattes
    expect(cupsLeft(latte, stock({ "espresso-beans": 1000, "fresh-milk": 2200 }))).toEqual({
      cups: 10,
      limitedBy: "fresh-milk",
    });
    expect(cupsLeft(latte, stock({ "espresso-beans": 50, "fresh-milk": 2200 }))).toEqual({
      cups: 2,
      limitedBy: "espresso-beans",
    });
  });

  it("rounds down and never goes negative", () => {
    expect(cupsLeft(mocha, stock({ "chocolate-sauce": 49 })).cups).toBe(1);
    expect(cupsLeft(mocha, stock({ "chocolate-sauce": -5 }))).toEqual({
      cups: 0,
      limitedBy: "chocolate-sauce",
    });
  });
});

describe("consume", () => {
  it("takes every ingredient for every cup off the shelf", () => {
    const before = stock({ "espresso-beans": 100, "fresh-milk": 1000, "chocolate-sauce": 100 });
    const after = consume(before, mocha, 3);
    expect(after["espresso-beans"]).toBe(100 - 54);
    expect(after["fresh-milk"]).toBe(1000 - 540);
    expect(after["chocolate-sauce"]).toBe(100 - 75);
    expect(after["kopi-powder"]).toBe(before["kopi-powder"]);
    expect(before["espresso-beans"]).toBe(100); // input untouched
  });

  it("refuses to take more than the shelf has", () => {
    const before = stock({ "fresh-milk": 300 });
    expect(shortfalls(latte, 2, before)).toEqual([{ ingredient: "fresh-milk", amount: 440, onShelf: 300 }]);
    expect(() => consume(before, latte, 2)).toThrow();
  });

  it("allows using the shelf down to exactly zero", () => {
    const after = consume(stock({ "fresh-milk": 440 }), latte, 2);
    expect(after["fresh-milk"]).toBe(0);
  });
});

describe("usageFor", () => {
  it("multiplies the per-cup amounts", () => {
    expect(usageFor(latte, 2)).toEqual([
      { ingredient: "espresso-beans", amount: 36 },
      { ingredient: "fresh-milk", amount: 440 },
    ]);
  });
});

describe("levelOf and fillOf", () => {
  it("flags stock below the reorder point", () => {
    expect(levelOf("vanilla-syrup", 0)).toBe("out");
    expect(levelOf("vanilla-syrup", 499)).toBe("low");
    expect(levelOf("vanilla-syrup", 500)).toBe("ok");
  });

  it("keeps the drawing between empty and full", () => {
    expect(fillOf("vanilla-syrup", 750)).toBe(0.5);
    expect(fillOf("vanilla-syrup", 9000)).toBe(1);
    expect(fillOf("vanilla-syrup", -10)).toBe(0);
  });
});

describe("formatting", () => {
  it("switches to kg and L for big amounts", () => {
    expect(formatAmount(320, "ml")).toBe("320 ml");
    expect(formatAmount(3400, "g")).toBe("3.4 kg");
    expect(formatAmount(1350, "g")).toBe("1.35 kg");
    expect(formatAmount(2000, "ml")).toBe("2 L");
  });

  it("names packs and cups in singular and plural", () => {
    expect(formatPacks("espresso-beans", 1)).toBe("1 bag");
    expect(formatPacks("condensed-milk", 4)).toBe("4 tins");
    expect(cupsOf(latte, 1)).toBe("1 latte");
    expect(cupsOf(getRecipe("americano")!, 3)).toBe("3 Americanos");
  });
});
