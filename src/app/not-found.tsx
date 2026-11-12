import Link from "next/link";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="text-sm font-semibold text-kopi-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-sm text-stone-600">
        The return or page you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link href="/" className={`${buttonClass("primary")} mt-8`}>
        Back to home
      </Link>
    </div>
  );
}
