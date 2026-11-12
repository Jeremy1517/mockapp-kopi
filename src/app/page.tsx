import Link from "next/link";
import { Card, buttonClass } from "@/components/ui";
import { formatNumber, formatPercent } from "@/lib/format";
import { RELIEFS, RESIDENT_BRACKETS, REBATE, TAX_YEARS } from "@/lib/tax/rules";

const steps = [
  {
    title: "Enter your details",
    body: "Identity, income from every source, and the reliefs you're entitled to.",
  },
  {
    title: "See your tax live",
    body: "A running estimate shows chargeable income, tax by band and your balance as you type.",
  },
  {
    title: "Submit & get a reference",
    body: "The server re-validates and recomputes everything, then issues an acknowledgement number.",
  },
];

const bands = RESIDENT_BRACKETS.map((b, i) => {
  const previousUpTo = i === 0 ? 0 : (RESIDENT_BRACKETS[i - 1].upTo ?? 0);
  return { from: i === 0 ? 0 : previousUpTo + 1, to: b.upTo, rate: b.rate };
});

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 pt-4 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-kopi-100 px-3 py-1 text-xs font-semibold text-kopi-800">
            Filing open for YA {TAX_YEARS.join(", ")}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            File your income tax return over one cup of kopi.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-stone-600">
            A simple, guided e-filing flow: tell us what you earned, claim your reliefs, and see exactly
            how your tax is worked out before you submit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/file" className={buttonClass("primary")}>
              Start a return
            </Link>
            <Link href="/submissions" className={buttonClass("secondary")}>
              View submissions
            </Link>
          </div>
        </div>

        <Card title="Resident tax bands" description="Applied to chargeable income after reliefs.">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-stone-100 tabular-nums">
              {bands.map((b) => (
                <tr key={b.from}>
                  <td className="py-1.5 text-stone-600">
                    {b.to === null ? `Above ${formatNumber(b.from - 1)}` : `${formatNumber(b.from)} – ${formatNumber(b.to)}`}
                  </td>
                  <td className="py-1.5 text-right font-medium text-stone-900">{formatPercent(b.rate, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-stone-500">
            Every resident gets {formatNumber(RELIEFS.individual)} individual relief, plus a{" "}
            {formatNumber(REBATE.amount)} rebate when chargeable income is {formatNumber(REBATE.chargeableIncomeThreshold)}{" "}
            or less. Non-residents pay a flat 30%.
          </p>
        </Card>
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold text-stone-900">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full">
                <span className="flex size-8 items-center justify-center rounded-full bg-kopi-700 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-stone-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-stone-600">{s.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
