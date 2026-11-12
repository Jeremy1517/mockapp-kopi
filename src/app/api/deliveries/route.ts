import { handleChange } from "@/server/pantry/http";
import { logDelivery } from "@/server/pantry/service";

/** POST /api/deliveries `{ ingredient, packs }` — add whole packs to the shelf. */
export function POST(request: Request) {
  return handleChange(request, logDelivery);
}
