import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { Submission } from "@/lib/submissions/types";

/**
 * Mock persistence: a JSON file on local disk (default `.data/submissions.json`).
 *
 * Good enough for a single local Node process. Swap this module for a real
 * database (Postgres, SQLite, …) without touching the service or UI — keep the
 * same exported functions.
 */

const dataFile = () =>
  path.join(process.env.DATA_DIR ?? path.join(process.cwd(), ".data"), "submissions.json");

// Serialises writes within this process so concurrent submissions can't clobber each other.
let writeQueue: Promise<unknown> = Promise.resolve();
function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<Submission[]> {
  try {
    return JSON.parse(await fs.readFile(dataFile(), "utf8")) as Submission[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(submissions: Submission[]): Promise<void> {
  const file = dataFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(submissions, null, 2), "utf8");
  await fs.rename(tmp, file); // atomic replace
}

export async function listSubmissions(): Promise<Submission[]> {
  const all = await readAll();
  return all.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function findSubmission(id: string): Promise<Submission | null> {
  return (await readAll()).find((s) => s.id === id) ?? null;
}

export type InsertResult = { ok: true } | { ok: false; conflict: Submission };

/**
 * Insert a submission. If `conflictsWith` matches an existing record the
 * insert is rejected — the check and the write happen under one lock.
 */
export function insertSubmission(
  submission: Submission,
  conflictsWith?: (existing: Submission) => boolean,
): Promise<InsertResult> {
  return withWriteLock(async () => {
    const all = await readAll();
    const conflict = conflictsWith ? all.find(conflictsWith) : undefined;
    if (conflict) return { ok: false, conflict };
    all.push(submission);
    await writeAll(all);
    return { ok: true };
  });
}
