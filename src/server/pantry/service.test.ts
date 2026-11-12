import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openingStock } from "@/lib/coffee/stock";
import { getPantry, logBrew, logCount, logDelivery } from "./service";

describe("pantry service", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "kopi-pantry-"));
    process.env.DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  it("starts a new shelf with opening stock and an empty log", async () => {
    expect(await getPantry()).toEqual({ stock: openingStock(), log: [] });
  });

  it("takes ingredients off the shelf when cups are logged", async () => {
    const result = await logBrew({ recipe: "latte", cups: "2" });
    expect(result).toMatchObject({ ok: true, message: "Logged 2 lattes." });

    const { stock, log } = await getPantry();
    expect(stock["espresso-beans"]).toBe(openingStock()["espresso-beans"] - 36);
    expect(stock["fresh-milk"]).toBe(openingStock()["fresh-milk"] - 440);
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ kind: "brew", recipe: "latte", cups: 2 });
  });

  it("rejects a brew the shelf can't cover and changes nothing", async () => {
    await logCount({ ingredient: "fresh-milk", amount: "300" });
    const before = await getPantry();

    const result = await logBrew({ recipe: "latte", cups: 2 });
    expect(result).toMatchObject({ ok: false, kind: "short" });
    if (result.ok) return;
    expect(result.message).toBe(
      "Not enough fresh milk for 2 lattes: they need 440 ml and the shelf has 300 ml.",
    );
    expect(await getPantry()).toEqual(before);
  });

  it("adds whole packs from a delivery", async () => {
    const result = await logDelivery({ ingredient: "espresso-beans", packs: 3 });
    expect(result).toMatchObject({ ok: true, message: "Added 3 bags of espresso beans." });
    const { stock, log } = await getPantry();
    expect(stock["espresso-beans"]).toBe(openingStock()["espresso-beans"] + 3000);
    expect(log[0]).toMatchObject({ kind: "delivery", packs: 3, amount: 3000 });
  });

  it("replaces stock with a physical count and remembers what was expected", async () => {
    await logCount({ ingredient: "vanilla-syrup", amount: 290 });
    const { stock, log } = await getPantry();
    expect(stock["vanilla-syrup"]).toBe(290);
    expect(log[0]).toMatchObject({ kind: "count", counted: 290, expected: openingStock()["vanilla-syrup"] });
  });

  it("keeps the newest log entry first", async () => {
    await logDelivery({ ingredient: "condensed-milk", packs: 1 });
    await logBrew({ recipe: "kopi", cups: 1 });
    const { log } = await getPantry();
    expect(log.map((e) => e.kind)).toEqual(["brew", "delivery"]);
  });

  it("returns field errors for bad input and stores nothing", async () => {
    const results = await Promise.all([
      logBrew({ recipe: "frappuccino", cups: 0 }),
      logDelivery({ ingredient: "paper-cups", packs: 1 }),
      logCount({ ingredient: "fresh-milk", amount: "" }),
      logCount({ ingredient: "fresh-milk", amount: -1 }),
    ]);
    for (const r of results) expect(r).toMatchObject({ ok: false, kind: "validation" });
    const [brew, delivery, blank] = results;
    if (brew.ok || delivery.ok || blank.ok) return;
    expect(Object.keys(brew.fieldErrors).sort()).toEqual(["cups", "recipe"]);
    expect(delivery.fieldErrors.ingredient).toBeDefined();
    expect(blank.fieldErrors.amount).toEqual(["Enter the amount you counted."]);
    expect(blank.message).toBe("Enter the amount you counted.");
    expect((await getPantry()).log).toHaveLength(0);
  });

  it("answers in Manglish when asked", async () => {
    const ok = await logDelivery({ ingredient: "condensed-milk", packs: 2 }, "manglish");
    expect(ok).toMatchObject({ ok: true, message: "Okay, added 2 tin susu pekat." });

    await logCount({ ingredient: "fresh-milk", amount: 300 });
    const short = await logBrew({ recipe: "latte", cups: 2 }, "manglish");
    expect(short).toMatchObject({
      ok: false,
      kind: "short",
      message: "Not enough susu segar for 2 latte lah: need 440 ml but rak only got 300 ml.",
    });

    const invalid = await logCount({ ingredient: "fresh-milk", amount: "" }, "manglish");
    expect(invalid).toMatchObject({ ok: false, message: "Key in how much you counted." });
  });

  it("serialises concurrent brews so stock can't go negative", async () => {
    await logCount({ ingredient: "fresh-milk", amount: 660 }); // exactly 3 lattes
    const results = await Promise.all(Array.from({ length: 5 }, () => logBrew({ recipe: "latte", cups: 1 })));
    expect(results.filter((r) => r.ok)).toHaveLength(3);
    expect((await getPantry()).stock["fresh-milk"]).toBe(0);
  });
});
