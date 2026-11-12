import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getIngredient } from "@/lib/coffee/ingredients";
import { RECIPES } from "@/lib/coffee/recipes";
import { cupsLeft, type Stock } from "@/lib/coffee/stock";
import { CupDrawing } from "./cup-drawing";
import { cx } from "./ui";

/** The menu, priced in cups the shelf can still make. */
export async function CupsBoard({ stock }: { stock: Stock }) {
  const { locale, t } = await getI18n();
  return (
    <section aria-labelledby="cups-title" className="mt-16">
      <h2 id="cups-title" className="font-sign text-3xl text-jade">
        {t.cupsBoard.title}
      </h2>
      <p className="mt-2 max-w-xl text-ink-soft">{t.cupsBoard.intro}</p>
      <ul className="mt-6 grid gap-x-14 md:grid-cols-2">
        {RECIPES.map((recipe) => {
          const { cups, limitedBy } = cupsLeft(recipe, stock);
          const limiting = getIngredient(limitedBy).name[locale];
          return (
            <li key={recipe.slug} className="border-b-2 border-dotted border-tile">
              <Link
                href={localePath(locale, `/recipes/${recipe.slug}`)}
                className="group grid grid-cols-[2.75rem_auto_1fr_auto] items-baseline gap-x-3 rounded-md py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
              >
                <CupDrawing recipe={recipe} still className="row-span-2 h-12 w-11 self-center" />
                <span className="text-lg font-semibold group-hover:text-jade">{recipe.name[locale]}</span>
                <span className="mb-1.5 self-end border-b-2 border-dotted border-ink/20" aria-hidden="true" />
                <span className={cx("font-sign text-2xl", cups < 10 ? "text-chili" : "text-jade")}>
                  {cups}
                  <span className="sr-only"> {t.cupsBoard.cupsLeft}</span>
                </span>
                <span className="col-span-3 col-start-2 text-sm text-ink-soft">
                  {cups === 0
                    ? t.cupsBoard.outOf(limiting.toLowerCase())
                    : t.cupsBoard.runsOutFirst(limiting)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
