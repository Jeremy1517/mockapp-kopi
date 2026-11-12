import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import { calculateTax } from "@/lib/tax/calculate";
import { fieldErrorsOf, taxReturnSchema, type FieldErrors } from "@/lib/tax/schema";
import type { Submission } from "@/lib/submissions/types";
import { findSubmission, insertSubmission, listSubmissions } from "./repository";

export type SubmitResult =
  | { ok: true; submission: Submission }
  | { ok: false; kind: "validation" | "conflict"; message: string; fieldErrors: FieldErrors };

const makeReference = (taxYear: number) =>
  `KT-${taxYear}-${randomBytes(4).toString("hex").toUpperCase()}`;

/**
 * File a tax return. Single entry point for both the Server Action (HTML form)
 * and the REST API, so business rules live in exactly one place:
 *
 *  1. Validate the payload against the shared schema.
 *  2. Recompute the tax on the server — client-side estimates are ignored.
 *  3. Reject a second return for the same Tax ID + year of assessment.
 *  4. Persist and return the acknowledgement.
 */
export async function submitTaxReturn(raw: unknown): Promise<SubmitResult> {
  const parsed = taxReturnSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      kind: "validation",
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrorsOf(parsed.error),
    };
  }

  const input = parsed.data;
  const submission: Submission = {
    id: randomUUID(),
    reference: makeReference(input.taxYear),
    status: "SUBMITTED",
    submittedAt: new Date().toISOString(),
    input,
    computation: calculateTax(input),
  };

  const result = await insertSubmission(
    submission,
    (s) => s.input.taxId === input.taxId && s.input.taxYear === input.taxYear,
  );

  if (!result.ok) {
    // Deliberately generic: don't leak details of someone else's return.
    const message = `A return for YA ${input.taxYear} has already been filed under this Tax ID.`;
    return { ok: false, kind: "conflict", message, fieldErrors: { taxId: [message] } };
  }

  return { ok: true, submission };
}

export { findSubmission as getSubmission, listSubmissions };
