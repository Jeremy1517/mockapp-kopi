import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TaxBreakdown } from "@/components/tax-breakdown";
import { Badge, Card, PageHeader, buttonClass } from "@/components/ui";
import { formatDateTime, formatMoney, maskTaxId } from "@/lib/format";
import { getSubmission } from "@/server/submissions/service";

export const metadata: Metadata = { title: "Acknowledgement" };

export default function SubmissionPage({ params }: PageProps<"/submissions/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-100" />}>
      <Acknowledgement params={params} />
    </Suspense>
  );
}

async function Acknowledgement({ params }: { params: PageProps<"/submissions/[id]">["params"] }) {
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  const { input, computation } = submission;
  const income = [
    ["Employment", input.employmentIncome],
    ["Business", input.businessIncome],
    ["Rental", input.rentalIncome],
    ["Other", input.otherIncome],
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow={`Year of assessment ${input.taxYear}`}
        title="Return received"
        description={`Thank you, ${input.fullName}. Keep your reference number for any follow-up.`}
        actions={
          <Link href="/submissions" className={buttonClass("secondary")}>
            All submissions
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Card>
            <dl className="grid gap-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Reference</dt>
                <dd className="mt-1 font-mono text-lg font-semibold text-kopi-800">{submission.reference}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Submitted</dt>
                <dd className="mt-1 text-sm font-medium text-stone-900">{formatDateTime(submission.submittedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Status</dt>
                <dd className="mt-1">
                  <Badge tone="info">Submitted</Badge>
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Taxpayer">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="Name" value={input.fullName} />
              <Detail label="Tax ID" value={maskTaxId(input.taxId)} mono />
              <Detail label="Email" value={input.email} />
              <Detail label="Phone" value={input.phone || "—"} />
              <Detail label="Residency" value={input.residency === "resident" ? "Resident" : "Non-resident"} />
              <Detail label="Marital status" value={input.maritalStatus === "married" ? "Married" : "Single"} />
            </dl>
          </Card>

          <Card title="Income declared">
            <dl className="divide-y divide-stone-100 text-sm">
              {income.map(([label, amount]) => (
                <div key={label} className="flex justify-between py-2">
                  <dt className="text-stone-600">{label}</dt>
                  <dd className="tabular-nums">{formatMoney(amount)}</dd>
                </div>
              ))}
              <div className="flex justify-between py-2 font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatMoney(computation.grossIncome)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <Card title="Tax computation" description="Calculated by the server at the time of filing.">
          <TaxBreakdown computation={computation} detailed />
        </Card>
      </div>
    </>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className={mono ? "mt-0.5 font-mono" : "mt-0.5 text-stone-900"}>{value}</dd>
    </div>
  );
}
