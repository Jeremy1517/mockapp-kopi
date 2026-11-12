import { handleChange } from "@/server/pantry/http";
import { logBrew } from "@/server/pantry/service";

/** POST /api/brews `{ recipe, cups }` — log cups made; 409 if the shelf can't cover them. */
export function POST(request: Request) {
  return handleChange(request, logBrew);
}
