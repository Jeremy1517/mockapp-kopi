import "server-only";

import { cache } from "react";
import { getPantry } from "./service";

/** Current stock, read once per request however many components ask for it. */
export const getStock = cache(async () => (await getPantry()).stock);
