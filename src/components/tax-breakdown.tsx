import type { TaxComputation } from "@/lib/tax/calculate";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { cx } from "./ui";

const outcomeCopy = {
  payable: { label: "Balance payable", tone: "bg-amber-50 text-amber-900 ring-amber-200" },
  refund: { label: "Refund due to you", tone: "bg-emerald-50 text-emerald-900 ring-emerald-200" },
  nil: { label: "Nothing to pay", tone: "bg-stone-100 text-stone-800 ring-stone-200" },
} as const;

function Row({
  label,
  value,
  muted,
  strong,
  indent,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex items-baseline justify-between gap-4 py-1.5 text-sm",
        indent && "pl-3",
        muted && "text-stone-500",
        strong && "font-semibold text-stone-900",
      )}
    >
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function bandLabel(from: number, to: number | null) {
  if (to === null) return from === 0 ? "All income" : `Above ${formatNumber(from)}`;
  return `${formatNumber(from === 0 ? 0 : from + 1)} – ${formatNumber(to)}`;
}

export function OutcomeBanner({ computation }: { computation: TaxComputation }) {
  const copy = outcomeCopy[computation.outcome];
  return (
    <div className={cx("rounded-xl px-4 py-3 ring-1 ring-inset", copy.tone)}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{copy.label}</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums">
        {formatMoney(Math.abs(computation.balance))}
      </p>
    </div>
  );
}

export function TaxBreakdown({
  computation: c,
  detailed = false,
}: {
  computation: TaxComputation;
  detailed?: boolean;
}) {
  return (
    <div className="space-y-4">
      <OutcomeBanner computation={c} />

      <dl className="divide-y divide-stone-100">
        <Row label="Gross income" value={formatMoney(c.grossIncome)} />
        <div className="py-1">
          <Row label="Less: total reliefs" value={`− ${formatMoney(c.totalReliefs)}`} />
          {c.reliefs.map((r) => (
            <Row
              key={r.key}
              indent
              muted
              label={r.allowed < r.claimed ? `${r.label} (capped; claimed ${formatNumber(r.claimed)})` : r.label}
              value={formatMoney(r.allowed)}
            />
          ))}
          {c.reliefs.length === 0 && (
            <p className="pl-3 pb-1 text-xs text-stone-500">Non-residents cannot claim reliefs.</p>
          )}
        </div>
        <Row label="Chargeable income" value={formatMoney(c.chargeableIncome)} strong />
        <Row label="Tax on chargeable income" value={formatMoney(c.taxBeforeRebate)} />
        {c.rebate > 0 && <Row label="Less: low-income rebate" value={`− ${formatMoney(c.rebate)}`} />}
        <Row label="Tax payable" value={formatMoney(c.taxPayable)} strong />
        <Row label="Less: tax already paid" value={`− ${formatMoney(c.taxAlreadyPaid)}`} />
        <Row label="Effective tax rate" value={formatPercent(c.effectiveRate)} muted />
      </dl>

      {detailed && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-stone-900">Tax by band</h3>
          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Band</th>
                  <th className="px-3 py-2 text-right font-medium">Rate</th>
                  <th className="px-3 py-2 text-right font-medium">Taxable</th>
                  <th className="px-3 py-2 text-right font-medium">Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 tabular-nums">
                {c.bands.map((b) => (
                  <tr key={b.from}>
                    <td className="whitespace-nowrap px-3 py-2 text-stone-700">{bandLabel(b.from, b.to)}</td>
                    <td className="px-3 py-2 text-right text-stone-500">{formatPercent(b.rate, 0)}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(b.taxableAmount)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatMoney(b.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
