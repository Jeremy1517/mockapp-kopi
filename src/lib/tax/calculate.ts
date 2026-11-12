import {
  MAX_CHILDREN,
  NON_RESIDENT_FLAT_RATE,
  REBATE,
  RELIEFS,
  RESIDENT_BRACKETS,
  type TaxBracket,
} from "./rules";

export type Residency = "resident" | "non_resident";
export type MaritalStatus = "single" | "married";

/** Everything the engine needs. Pure numbers — no strings, no I/O. */
export interface TaxInput {
  residency: Residency;
  maritalStatus: MaritalStatus;
  employmentIncome: number;
  businessIncome: number;
  rentalIncome: number;
  otherIncome: number;
  retirementContributions: number;
  medicalExpenses: number;
  lifestyleExpenses: number;
  childrenCount: number;
  spouseRelief: boolean;
  taxAlreadyPaid: number;
}

export interface ReliefLine {
  key: string;
  label: string;
  claimed: number;
  allowed: number;
}

export interface BandLine {
  from: number;
  to: number | null;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export type Outcome = "payable" | "refund" | "nil";

export interface TaxComputation {
  grossIncome: number;
  reliefs: ReliefLine[];
  totalReliefs: number;
  chargeableIncome: number;
  bands: BandLine[];
  taxBeforeRebate: number;
  rebate: number;
  taxPayable: number;
  taxAlreadyPaid: number;
  /** Positive: amount still owed. Negative: refund due to the taxpayer. */
  balance: number;
  outcome: Outcome;
  /** Tax payable as a fraction of gross income (0–1). */
  effectiveRate: number;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const nonNegative = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function computeReliefs(input: TaxInput): ReliefLine[] {
  if (input.residency === "non_resident") return [];

  const lines: ReliefLine[] = [
    {
      key: "individual",
      label: "Individual relief",
      claimed: RELIEFS.individual,
      allowed: RELIEFS.individual,
    },
  ];

  if (input.maritalStatus === "married" && input.spouseRelief) {
    lines.push({
      key: "spouse",
      label: "Spouse relief",
      claimed: RELIEFS.spouse,
      allowed: RELIEFS.spouse,
    });
  }

  const children = Math.min(
    Math.floor(nonNegative(input.childrenCount)),
    MAX_CHILDREN,
  );
  if (children > 0) {
    const amount = children * RELIEFS.perChild;
    lines.push({
      key: "children",
      label: `Child relief (${children} × ${RELIEFS.perChild.toLocaleString()})`,
      claimed: amount,
      allowed: amount,
    });
  }

  const capped: Array<[key: string, label: string, claimed: number, cap: number]> = [
    ["retirement", "Retirement & life insurance", input.retirementContributions, RELIEFS.retirementCap],
    ["medical", "Medical expenses", input.medicalExpenses, RELIEFS.medicalCap],
    ["lifestyle", "Lifestyle purchases", input.lifestyleExpenses, RELIEFS.lifestyleCap],
  ];
  for (const [key, label, rawClaimed, cap] of capped) {
    const claimed = round2(nonNegative(rawClaimed));
    if (claimed > 0) {
      lines.push({ key, label, claimed, allowed: Math.min(claimed, cap) });
    }
  }

  return lines;
}

export function applyBrackets(
  chargeableIncome: number,
  brackets: readonly TaxBracket[],
): BandLine[] {
  const lines: BandLine[] = [];
  let lower = 0;

  for (const bracket of brackets) {
    const upper = bracket.upTo ?? Number.POSITIVE_INFINITY;
    const taxableAmount = round2(Math.max(0, Math.min(chargeableIncome, upper) - lower));
    lines.push({
      from: lower,
      to: bracket.upTo,
      rate: bracket.rate,
      taxableAmount,
      tax: round2(taxableAmount * bracket.rate),
    });
    if (chargeableIncome <= upper) break;
    lower = upper;
  }

  return lines;
}

export function calculateTax(input: TaxInput): TaxComputation {
  const isResident = input.residency === "resident";

  const grossIncome = round2(
    nonNegative(input.employmentIncome) +
      nonNegative(input.businessIncome) +
      nonNegative(input.rentalIncome) +
      nonNegative(input.otherIncome),
  );

  const reliefs = computeReliefs(input);
  const totalReliefs = round2(reliefs.reduce((sum, r) => sum + r.allowed, 0));
  const chargeableIncome = round2(Math.max(0, grossIncome - totalReliefs));

  const bands = isResident
    ? applyBrackets(chargeableIncome, RESIDENT_BRACKETS)
    : applyBrackets(chargeableIncome, [{ upTo: null, rate: NON_RESIDENT_FLAT_RATE }]);

  const taxBeforeRebate = round2(bands.reduce((sum, b) => sum + b.tax, 0));

  const rebate =
    isResident && chargeableIncome <= REBATE.chargeableIncomeThreshold
      ? Math.min(REBATE.amount, taxBeforeRebate)
      : 0;

  const taxPayable = round2(taxBeforeRebate - rebate);
  const taxAlreadyPaid = round2(nonNegative(input.taxAlreadyPaid));
  const balance = round2(taxPayable - taxAlreadyPaid);

  return {
    grossIncome,
    reliefs,
    totalReliefs,
    chargeableIncome,
    bands,
    taxBeforeRebate,
    rebate,
    taxPayable,
    taxAlreadyPaid,
    balance,
    outcome: balance > 0 ? "payable" : balance < 0 ? "refund" : "nil",
    effectiveRate: grossIncome > 0 ? taxPayable / grossIncome : 0,
  };
}
