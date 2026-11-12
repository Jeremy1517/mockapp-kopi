import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { DocumentReference } from "@google-cloud/firestore";
import { connection } from "next/server";
import { INGREDIENTS } from "@/lib/coffee/ingredients";
import type { Pantry } from "@/lib/coffee/log";
import { openingStock } from "@/lib/coffee/stock";

/**
 * Persistence for the pantry. The environment picks the store:
 *
 *  - `DATA_PATH` set: one Firestore document, `<DATA_PATH>/pantry/0000`, in the
 *    database `FIRESTORE_DATABASE`. A Preview from G-Unit Test runs this way, so
 *    each Preview keeps its own shelf (see `demo-datasets/`).
 *  - `DATA_PATH` not set: one JSON file on local disk (default `.data/pantry.json`,
 *    override the folder with `DATA_DIR`). Good enough for a single local Node process.
 *
 * Swap this module for another database without touching the service or UI —
 * keep the same exports.
 */

type Change<T> = (current: Pantry) => { next: Pantry | null; result: T };

/** Saved data → a full pantry. Nothing saved is a brand-new shelf with opening stock. */
function pantryFrom(saved: Partial<Pantry>): Pantry {
  const stock = openingStock();
  // Only keep ingredients the catalogue still knows about.
  for (const { id } of INGREDIENTS) {
    const amount = saved.stock?.[id];
    if (typeof amount === "number" && Number.isFinite(amount)) stock[id] = amount;
  }
  return { stock, log: Array.isArray(saved.log) ? saved.log : [] };
}

// ---------- Firestore ----------

// The package is loaded only when Firestore is used, so the file store works without it.
let pantryDoc: Promise<DocumentReference> | undefined;
async function firestoreDoc(): Promise<DocumentReference> {
  // The Firestore client makes random IDs, which Next.js rejects while it prerenders
  // a page. Wait for a real request first.
  await connection();
  pantryDoc ??=import("@google-cloud/firestore").then(({ Firestore }) =>
    new Firestore({ databaseId: process.env.FIRESTORE_DATABASE }).doc(`${process.env.DATA_PATH}/pantry/0000`),
  );
  return pantryDoc;
}

async function readFromFirestore(): Promise<Pantry> {
  const doc = await firestoreDoc();
  return pantryFrom((await doc.get()).data() ?? {});
}

/** One transaction, so two updates can't clobber each other. Firestore may run `change` again. */
async function updateInFirestore<T>(change: Change<T>): Promise<T> {
  const doc = await firestoreDoc();
  return doc.firestore.runTransaction(async (tx) => {
    const { next, result } = change(pantryFrom((await tx.get(doc)).data() ?? {}));
    if (next) tx.set(doc, next);
    return result;
  });
}

// ---------- JSON file ----------

const dataFile = () => path.join(process.env.DATA_DIR ?? path.join(process.cwd(), ".data"), "pantry.json");

// Serialises writes within this process so two updates can't clobber each other.
let writeQueue: Promise<unknown> = Promise.resolve();
function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.catch(() => undefined);
  return run;
}

async function readFromFile(): Promise<Pantry> {
  let saved: Partial<Pantry> = {};
  try {
    saved = JSON.parse(await fs.readFile(dataFile(), "utf8")) as Partial<Pantry>;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
  return pantryFrom(saved);
}

async function writeToFile(pantry: Pantry): Promise<void> {
  const file = dataFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(pantry, null, 2), "utf8");
  await fs.rename(tmp, file); // atomic replace
}

function updateInFile<T>(change: Change<T>): Promise<T> {
  return withWriteLock(async () => {
    const { next, result } = change(await readFromFile());
    if (next) await writeToFile(next);
    return result;
  });
}

// ---------- The two exports ----------

const onFirestore = () => Boolean(process.env.DATA_PATH);

/** Reads the pantry; nothing saved yet is a brand-new shelf with opening stock. */
export function readPantry(): Promise<Pantry> {
  return onFirestore() ? readFromFirestore() : readFromFile();
}

/**
 * Read, change and save the pantry as one step. `change` returns the new
 * pantry to save (or `null` to save nothing) plus a result for the caller.
 */
export function updatePantry<T>(change: Change<T>): Promise<T> {
  return onFirestore() ? updateInFirestore(change) : updateInFile(change);
}
