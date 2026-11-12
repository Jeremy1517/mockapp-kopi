import { handleChange } from "@/server/pantry/http";
import { logCount } from "@/server/pantry/service";

/** POST /api/counts `{ ingredient, amount }` — replace stock with a physical count. */
export function POST(request: Request) {
  return handleChange(request, logCount);
}
