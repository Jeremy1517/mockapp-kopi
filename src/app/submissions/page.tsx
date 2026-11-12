import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge, Card, PageHeader, buttonClass } from "@/components/ui";
import { formatDateTime, formatMoney, maskTaxId } from "@/lib/format";
import { listSubmissions } from "@/server/submissions/service";

export const metadata: Metadata = { title: "Submissions" };

const outcomeLabel = { payable: "Payable", refund: "Refund", nil: "Nil" } as const;

export default function SubmissionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Submitted returns"
        description="Every return filed through this portal, newest first."
        actions={
          <Link href="/file" className={buttonClass("primary")}>
            New return
          </Link>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <SubmissionsTable />
      </Suspense>
    </>
  );
}

async function SubmissionsTable() {
  const submissions = await listSubmissions();

  if (submissions.length === 0) {
    return (
      <Card className="py-14 text-center">
        <p className="font-medium text-stone-900">No returns filed yet</p>
        <p className="mt-1 text-sm text-stone-500">Submitted returns will appear here.</p>
        <Link href="/file" className={`${buttonClass("primary")} mt-6`}>
          File your first return
        </Link>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Taxpayer</th>
            <th className="px-4 py-3 font-medium">YA</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3 text-right font-medium">Tax payable</th>
            <th className="px-4 py-3 text-right font-medium">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {submissions.map((s) => (
            <tr key={s.id} className="transition hover:bg-stone-50">
              <td className="px-4 py-3">
                <Link href={`/submissions/${s.id}`} className="font-mono text-xs font-medium text-kopi-700 hover:underline">
                  {s.reference}
                </Link>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-stone-900">{s.input.fullName}</div>
                <div className="font-mono text-xs text-stone-500">{maskTaxId(s.input.taxId)}</div>
              </td>
              <td className="px-4 py-3 tabular-nums">{s.input.taxYear}</td>
              <td className="px-4 py-3 text-stone-600">{formatDateTime(s.submittedAt)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(s.computation.taxPayable)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2 tabular-nums">
                  <Badge tone={s.computation.outcome}>{outcomeLabel[s.computation.outcome]}</Badge>
                  {formatMoney(Math.abs(s.computation.balance))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-4" aria-busy="true">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-stone-100" />
      ))}
    </div>
  );
}
