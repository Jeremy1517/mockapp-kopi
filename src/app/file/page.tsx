import type { Metadata } from "next";
import { TaxReturnForm } from "@/components/tax-return-form";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "File a return" };

export default function FilePage() {
  return (
    <>
      <PageHeader
        eyebrow="Individual income tax"
        title="File your tax return"
        description="Complete each section below. Your estimate updates live; the official figures are recalculated on our servers when you submit."
      />
      <TaxReturnForm />
    </>
  );
}
