import Link from "next/link";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="max-w-lg py-12">
      <h1 className="font-sign text-4xl text-jade">Not on the menu</h1>
      <p className="mt-3 text-lg text-ink-soft">
        There&apos;s no page or recipe at this address. It may have been renamed.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/recipes" className={buttonClass()}>
          See all recipes
        </Link>
        <Link href="/" className={buttonClass("quiet")}>
          Go to the shelf
        </Link>
      </div>
    </div>
  );
}
