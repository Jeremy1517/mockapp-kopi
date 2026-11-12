import { notFound } from "next/navigation";

/** Any URL under a language that isn't a page: show that language's not-found page. */
export function generateStaticParams() {
  return [{ rest: ["not-found"] }];
}

export default function CatchAll() {
  notFound();
}
