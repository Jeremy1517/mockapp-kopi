import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageTitle, buttonClass } from "@/components/ui";
import { getIngredient } from "@/lib/coffee/ingredients";
import type { LogEntry } from "@/lib/coffee/log";
import { getRecipe } from "@/lib/coffee/recipes";
import { cupsOf, formatAmount, formatPacks } from "@/lib/coffee/stock";
import { dayKey, formatDay, formatTime } from "@/lib/format";
import { getPantry } from "@/server/pantry/service";

export const metadata: Metadata = { title: "Bar log" };

export default function LogPage() {
  return (
    <>
      <PageTitle title="Bar log">
        <p>Every cup logged, delivery received and count taken, newest first.</p>
      </PageTitle>
      <Suspense fallback={<div className="h-64 max-w-3xl rounded-2xl bg-mint" aria-busy="true" />}>
        <Entries />
      </Suspense>
    </>
  );
}

async function Entries() {
  const { log } = await getPantry();

  if (log.length === 0) {
    return (
      <div className="max-w-xl rounded-2xl border-2 border-dashed border-tile p-8">
        <p className="text-lg font-semibold">Nothing logged yet</p>
        <p className="mt-1 text-ink-soft">
          Log a delivery or a count from the shelf, or log cups made from any recipe.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className={buttonClass()}>
            Go to the shelf
          </Link>
          <Link href="/recipes" className={buttonClass("quiet")}>
            Open a recipe
          </Link>
        </div>
      </div>
    );
  }

  const days = new Map<string, LogEntry[]>();
  for (const entry of log) {
    const key = dayKey(entry.at);
    days.set(key, [...(days.get(key) ?? []), entry]);
  }

  return (
    <div className="max-w-3xl space-y-12">
      {[...days.values()].map((entries) => (
        <section key={entries[0].id} aria-label={formatDay(entries[0].at)}>
          <h2 className="font-sign text-xl text-jade">{formatDay(entries[0].at)}</h2>
          <ul className="mt-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="grid grid-cols-[4.5rem_1fr] gap-4 border-b-2 border-dotted border-tile py-3.5"
              >
                <time dateTime={entry.at} className="pt-0.5 text-sm text-ink-soft">
                  {formatTime(entry.at)}
                </time>
                <Describe entry={entry} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Describe({ entry }: { entry: LogEntry }) {
  switch (entry.kind) {
    case "brew": {
      const recipe = getRecipe(entry.recipe);
      const used = entry.used.map((u) => {
        const { name, unit } = getIngredient(u.ingredient);
        return `${formatAmount(u.amount, unit)} ${name.toLowerCase()}`;
      });
      return (
        <div>
          <p className="font-semibold">
            Made {recipe ? cupsOf(recipe, entry.cups) : `${entry.cups} × ${entry.recipe}`}
          </p>
          <p className="text-sm text-ink-soft">Used {joinAnd(used)}.</p>
        </div>
      );
    }
    case "delivery": {
      const { name, unit } = getIngredient(entry.ingredient);
      return (
        <div>
          <p className="font-semibold">
            Received {formatPacks(entry.ingredient, entry.packs)} of {name.toLowerCase()}
          </p>
          <p className="text-sm text-ink-soft">Added {formatAmount(entry.amount, unit)} to the shelf.</p>
        </div>
      );
    }
    case "count": {
      const { name, unit } = getIngredient(entry.ingredient);
      const diff = Math.round((entry.counted - entry.expected) * 100) / 100;
      return (
        <div>
          <p className="font-semibold">
            Counted {formatAmount(entry.counted, unit)} of {name.toLowerCase()}
          </p>
          <p className={diff < 0 ? "text-sm text-chili" : "text-sm text-ink-soft"}>
            {diff === 0
              ? "Matched what the shelf expected."
              : `${formatAmount(Math.abs(diff), unit)} ${diff < 0 ? "less" : "more"} than the shelf expected.`}
          </p>
        </div>
      );
    }
  }
}

const joinAnd = (parts: string[]) =>
  parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : (parts[0] ?? "");
