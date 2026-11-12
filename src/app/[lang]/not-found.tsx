import Link from "next/link";
import { buttonClass } from "@/components/ui";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { locale, t } = await getI18n();
  return (
    <div className="max-w-lg py-12">
      <h1 className="font-sign text-4xl text-jade">{t.notFound.title}</h1>
      <p className="mt-3 text-lg text-ink-soft">{t.notFound.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={localePath(locale, "/recipes")} className={buttonClass()}>
          {t.notFound.recipes}
        </Link>
        <Link href={localePath(locale, "/")} className={buttonClass("quiet")}>
          {t.notFound.shelf}
        </Link>
      </div>
    </div>
  );
}
