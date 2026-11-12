import type { IngredientId } from "./ingredients";
import type { Stock, Usage } from "./stock";

/** One line in the bar log. Every change to stock writes exactly one. */
export type LogEntry =
  | { id: string; at: string; kind: "brew"; recipe: string; cups: number; used: Usage[] }
  | { id: string; at: string; kind: "delivery"; ingredient: IngredientId; packs: number; amount: number }
  | { id: string; at: string; kind: "count"; ingredient: IngredientId; counted: number; expected: number };

export interface Pantry {
  stock: Stock;
  /** Newest first. */
  log: LogEntry[];
}
