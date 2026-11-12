import type { TaxComputation } from "@/lib/tax/calculate";
import type { TaxReturnInput } from "@/lib/tax/schema";

export type SubmissionStatus = "SUBMITTED";

export interface Submission {
  id: string;
  /** Human-friendly acknowledgement number, e.g. KT-2025-8F3A2B1C. */
  reference: string;
  status: SubmissionStatus;
  submittedAt: string;
  input: TaxReturnInput;
  /** Server-side computation at the time of filing (client figures are never stored). */
  computation: TaxComputation;
}
