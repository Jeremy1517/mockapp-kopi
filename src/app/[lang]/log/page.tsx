import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageTitle, buttonClass } from "@/components/ui";
import { joinList, type Dictionary } from "@/i18n";
import { localePath, type Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getIngredient } from "@/lib/coffee/ingredients";
import type { LogEntry } from "@/lib/coffee/log";
import { getRecipe } from "@/lib/coffee/recipes";
import { cupsOf, formatAmount, formatPacks } from "@/lib/coffee/stock";
import { dayKey, formatDay, formatTime } from "@/lib/format";
import { getPantry } from "@/server/pantry/service";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.log.title };
}

export default async function LogPage() {
  const { t } = await getI18n();
  return (
    <>
      <PageTitle title={t.log.title}>
        <p>{t.log.intro}</p>
      </PageTitle>
      <Suspense fallback={<div className="h-64 max-w-3xl rounded-2xl bg-mint" aria-busy="true" />}>
        <Entries />
      </Suspense>
    </>
  );
}

async function Entries() {
  const [{ log }, { locale, t }] = await Promise.all([getPantry(), getI18n()]);

  if (log.length === 0) {
    return (
      <div className="max-w-xl rounded-2xl border-2 border-dashed border-tile p-8">
        <p className="text-lg font-semibold">{t.log.emptyTitle}</p>
        <p className="mt-1 text-ink-soft">{t.log.emptyBody}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={localePath(locale, "/")} className={buttonClass()}>
            {t.log.goShelf}
          </Link>
          <Link href={localePath(locale, "/recipes")} className={buttonClass("quiet")}>
            {t.log.openRecipe}
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
                <Describe entry={entry} locale={locale} t={t} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Describe({ entry, locale, t }: { entry: LogEntry; locale: Locale; t: Dictionary }) {
  switch (entry.kind) {
    case "brew": {
      const recipe = getRecipe(entry.recipe);
      const used = entry.used.map((u) => {
        const { name, unit } = getIngredient(u.ingredient);
        return `${formatAmount(u.amount, unit)} ${name[locale].toLowerCase()}`;
      });
      return (
        <div>
          <p className="font-semibold">
            {t.log.made(recipe ? cupsOf(recipe, entry.cups, locale) : `${entry.cups} × ${entry.recipe}`)}
          </p>
          <p className="text-sm text-ink-soft">{t.log.used(joinList(t, used))}</p>
        </div>
      );
    }
    case "delivery": {
      const { name, unit } = getIngredient(entry.ingredient);
      return (
        <div>
          <p className="font-semibold">
            {t.log.received(formatPacks(entry.ingredient, entry.packs, locale), name[locale].toLowerCase())}
          </p>
          <p className="text-sm text-ink-soft">{t.log.added(formatAmount(entry.amount, unit))}</p>
        </div>
      );
    }
    case "count": {
      const { name, unit } = getIngredient(entry.ingredient);
      const diff = Math.round((entry.counted - entry.expected) * 100) / 100;
      return (
        <div>
          <p className="font-semibold">
            {t.log.counted(formatAmount(entry.counted, unit), name[locale].toLowerCase())}
          </p>
          <p className={diff < 0 ? "text-sm text-chili" : "text-sm text-ink-soft"}>
            {diff === 0 ? t.log.matched : t.log.off(formatAmount(Math.abs(diff), unit), diff < 0)}
          </p>
        </div>
      );
    }
  }
}
