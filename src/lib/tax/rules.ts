/**
 * Tax rules for the Kopi Tax mock portal.
 *
 * These figures are ILLUSTRATIVE ONLY. They are loosely modelled on a
 * progressive resident income-tax schedule and are not official rates.
 * Change them here — every calculation, form and page reads from this file.
 */

export const CURRENCY = "MYR";
export const LOCALE = "en-MY";
export const TIME_ZONE = "Asia/Kuala_Lumpur";

/** Years of assessment (YA) currently open for filing, newest first. */
export const TAX_YEARS = [2025, 2024, 2023] as const;
export type TaxYear = (typeof TAX_YEARS)[number];

export interface TaxBracket {
  /** Inclusive upper bound of the band; `null` means no upper limit. */
  upTo: number | null;
  rate: number;
}

/** Progressive schedule applied to a resident's chargeable income. */
export const RESIDENT_BRACKETS: readonly TaxBracket[] = [
  { upTo: 5_000, rate: 0 },
  { upTo: 20_000, rate: 0.01 },
  { upTo: 35_000, rate: 0.03 },
  { upTo: 50_000, rate: 0.06 },
  { upTo: 70_000, rate: 0.11 },
  { upTo: 100_000, rate: 0.19 },
  { upTo: 400_000, rate: 0.25 },
  { upTo: 600_000, rate: 0.26 },
  { upTo: 2_000_000, rate: 0.28 },
  { upTo: null, rate: 0.3 },
];

/** Non-residents pay a flat rate and cannot claim reliefs or rebates. */
export const NON_RESIDENT_FLAT_RATE = 0.3;

export const RELIEFS = {
  /** Granted automatically to every resident individual. */
  individual: 9_000,
  /** Married taxpayer whose spouse has no income. */
  spouse: 4_000,
  perChild: 2_000,
  /** Retirement fund contributions + life insurance premiums. */
  retirementCap: 7_000,
  medicalCap: 10_000,
  /** Books, devices, internet subscriptions, sports equipment. */
  lifestyleCap: 2_500,
} as const;

export const MAX_CHILDREN = 12;

/** Flat rebate for low-income residents, never more than the tax itself. */
export const REBATE = {
  amount: 400,
  chargeableIncomeThreshold: 35_000,
} as const;

/** Upper sanity bound for any single monetary field. */
export const MAX_AMOUNT = 100_000_000;
