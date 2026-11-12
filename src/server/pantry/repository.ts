import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { INGREDIENTS } from "@/lib/coffee/ingredients";
import type { Pantry } from "@/lib/coffee/log";
import { openingStock } from "@/lib/coffee/stock";

/**
 * Mock persistence: one JSON file on local disk (default `.data/pantry.json`).
 *
 * Good enough for a single local Node process. Swap this module for a real
 * database without touching the service or UI — keep the same exports.
 */

const dataFile = () => path.join(process.env.DATA_DIR ?? path.join(process.cwd(), ".data"), "pantry.json");

// Serialises writes within this process so two updates can't clobber each other.
let writeQueue: Promise<unknown> = Promise.resolve();
function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.catch(() => undefined);
  return run;
}

/** Reads the pantry; a missing file is a brand-new shelf with opening stock. */
export async function readPantry(): Promise<Pantry> {
  let saved: Partial<Pantry> = {};
  try {
    saved = JSON.parse(await fs.readFile(dataFile(), "utf8")) as Partial<Pantry>;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
  const stock = openingStock();
  // Only keep ingredients the catalogue still knows about.
  for (const { id } of INGREDIENTS) {
    const amount = saved.stock?.[id];
    if (typeof amount === "number" && Number.isFinite(amount)) stock[id] = amount;
  }
  return { stock, log: Array.isArray(saved.log) ? saved.log : [] };
}

async function writePantry(pantry: Pantry): Promise<void> {
  const file = dataFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(pantry, null, 2), "utf8");
  await fs.rename(tmp, file); // atomic replace
}

/**
 * Read, change and save the pantry under one lock. `change` returns the new
 * pantry to save (or `null` to save nothing) plus a result for the caller.
 */
export function updatePantry<T>(change: (current: Pantry) => { next: Pantry | null; result: T }): Promise<T> {
  return withWriteLock(async () => {
    const { next, result } = change(await readPantry());
    if (next) await writePantry(next);
    return result;
  });
}
