import { Suspense } from "react";
import { CupsBoard } from "@/components/cups-board";
import { Shelf } from "@/components/shelf";
import { PageTitle } from "@/components/ui";
import { joinList, type Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { INGREDIENTS, isIngredientId } from "@/lib/coffee/ingredients";
import { levelOf, type Stock } from "@/lib/coffee/stock";
import { getPantry } from "@/server/pantry/service";

export default async function ShelfPage({ searchParams }: PageProps<"/[lang]">) {
  const { t } = await getI18n();
  return (
    <>
      <PageTitle title={t.shelf.title}>
        <p>{t.shelf.intro}</p>
      </PageTitle>
      <Suspense fallback={<ShelfSkeleton label={t.shelf.loading} />}>
        <ShelfWithStock searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ShelfWithStock({ searchParams }: Pick<PageProps<"/[lang]">, "searchParams">) {
  const [{ item }, { stock }, { locale, t }] = await Promise.all([searchParams, getPantry(), getI18n()]);
  return (
    <>
      <ReorderSummary stock={stock} locale={locale} t={t} />
      <Shelf stock={stock} initial={isIngredientId(item) ? item : undefined} />
      <CupsBoard stock={stock} />
    </>
  );
}

function ReorderSummary({ stock, locale, t }: { stock: Stock; locale: Locale; t: Dictionary }) {
  const low = INGREDIENTS.filter((i) => levelOf(i.id, stock[i.id]) !== "ok").map((i, n) =>
    n === 0 ? i.name[locale] : i.name[locale].toLowerCase(),
  );
  if (low.length === 0) {
    return <p className="mb-5 font-medium text-jade">{t.shelf.allGood}</p>;
  }
  return (
    <p className="mb-5 flex items-center gap-2.5 font-medium text-chili">
      <span className="size-2.5 shrink-0 rounded-full bg-chili" aria-hidden="true" />
      {low.length === 1 ? t.shelf.belowOne(low[0]) : t.shelf.belowMany(joinList(t, low))}
    </p>
  );
}

function ShelfSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <div className="mb-5 h-6 w-72 max-w-full rounded bg-mint" />
      <div className="h-[22rem] rounded-2xl border-2 border-tile bg-mint lg:h-[16rem]" />
    </div>
  );
}
