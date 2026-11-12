import { Suspense } from "react";
import { CupsBoard } from "@/components/cups-board";
import { Shelf } from "@/components/shelf";
import { PageTitle } from "@/components/ui";
import { INGREDIENTS, isIngredientId } from "@/lib/coffee/ingredients";
import { levelOf, type Stock } from "@/lib/coffee/stock";
import { getPantry } from "@/server/pantry/service";

export default function ShelfPage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <PageTitle title="On the shelf">
        <p>
          Every ingredient your menu is made from, and nothing else. Tap one to log a delivery or count
          what&apos;s left. The dashed red line on each container is where you reorder.
        </p>
      </PageTitle>
      <Suspense fallback={<ShelfSkeleton />}>
        <ShelfWithStock searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ShelfWithStock({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const [{ item }, { stock }] = await Promise.all([searchParams, getPantry()]);
  return (
    <>
      <ReorderSummary stock={stock} />
      <Shelf stock={stock} initial={isIngredientId(item) ? item : undefined} />
      <CupsBoard stock={stock} />
    </>
  );
}

function ReorderSummary({ stock }: { stock: Stock }) {
  const low = INGREDIENTS.filter((i) => levelOf(i.id, stock[i.id]) !== "ok").map((i, n) =>
    n === 0 ? i.name : i.name.toLowerCase(),
  );
  if (low.length === 0) {
    return <p className="mb-5 font-medium text-jade">Everything is above its reorder line.</p>;
  }
  const names = low.length === 1 ? low[0] : `${low.slice(0, -1).join(", ")} and ${low.at(-1)}`;
  return (
    <p className="mb-5 flex items-center gap-2.5 font-medium text-chili">
      <span className="size-2.5 shrink-0 rounded-full bg-chili" aria-hidden="true" />
      {low.length === 1 ? `${names} is below its reorder line.` : `${names} are below their reorder lines.`}
    </p>
  );
}

function ShelfSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading the shelf">
      <div className="mb-5 h-6 w-72 max-w-full rounded bg-mint" />
      <div className="h-[22rem] rounded-2xl border-2 border-tile bg-mint lg:h-[16rem]" />
    </div>
  );
}
