import { connection } from "next/server";
import { toLocale } from "@/i18n/config";
import { INGREDIENTS } from "@/lib/coffee/ingredients";
import { RECIPES } from "@/lib/coffee/recipes";
import { cupsLeft, levelOf } from "@/lib/coffee/stock";
import { getPantry } from "@/server/pantry/service";

/** GET /api/pantry[?lang=manglish] — stock on the shelf, cups left per drink and the bar log. */
export async function GET(request: Request) {
  await connection();
  const locale = toLocale(new URL(request.url).searchParams.get("lang"));
  const { stock, log } = await getPantry();
  return Response.json({
    stock: INGREDIENTS.map((i) => ({
      ingredient: i.id,
      name: i.name[locale],
      unit: i.unit,
      amount: stock[i.id],
      reorderAt: i.reorderAt,
      level: levelOf(i.id, stock[i.id]),
    })),
    cupsLeft: RECIPES.map((r) => ({ recipe: r.slug, ...cupsLeft(r, stock) })),
    log,
  });
}
