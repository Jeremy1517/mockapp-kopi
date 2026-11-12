import { z } from "zod";
import { MAX_AMOUNT, MAX_CHILDREN, TAX_YEARS } from "./rules";

/**
 * Shared validation for a tax return. Used by the browser (instant feedback)
 * and by the server (the source of truth — never trust the client).
 */

const emptyToZero = (v: unknown) => (v === "" || v === null || v === undefined ? 0 : v);

const amount = (label: string) =>
  z.preprocess(
    emptyToZero,
    z.coerce
      .number({ error: `${label} must be a number` })
      .min(0, `${label} cannot be negative`)
      .max(MAX_AMOUNT, `${label} looks too large`)
      .refine(
        (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6,
        `${label} can have at most 2 decimal places`,
      ),
  );

/** HTML checkboxes submit "on" when ticked and nothing when not. */
const checkbox = z.preprocess(
  (v) => v === true || v === "on" || v === "true",
  z.boolean(),
);

export const taxReturnFields = z.object({
  // Taxpayer
  fullName: z
    .string({ error: "Enter your full name" })
    .trim()
    .min(3, "Enter your full name as per your ID")
    .max(120, "Name is too long"),
  taxId: z
    .string({ error: "Enter your Tax ID" })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}\d{10}$/, "Tax ID is 2 letters followed by 10 digits, e.g. SG1234567890"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9 -]{7,14}$/, "Enter a valid phone number")
    .or(z.literal(""))
    .optional(),
  taxYear: z.coerce
    .number({ error: "Select a year of assessment" })
    .refine((y) => (TAX_YEARS as readonly number[]).includes(y), "That year of assessment is not open for filing"),
  residency: z.enum(["resident", "non_resident"], { error: "Select your residency status" }),
  maritalStatus: z.enum(["single", "married"], { error: "Select your marital status" }),

  // Income
  employmentIncome: amount("Employment income"),
  businessIncome: amount("Business income"),
  rentalIncome: amount("Rental income"),
  otherIncome: amount("Other income"),

  // Reliefs
  retirementContributions: amount("Retirement contributions"),
  medicalExpenses: amount("Medical expenses"),
  lifestyleExpenses: amount("Lifestyle purchases"),
  childrenCount: z.preprocess(
    emptyToZero,
    z.coerce
      .number({ error: "Number of children must be a number" })
      .int("Number of children must be a whole number")
      .min(0, "Number of children cannot be negative")
      .max(MAX_CHILDREN, `At most ${MAX_CHILDREN} children can be claimed`),
  ),
  spouseRelief: checkbox,

  // Payments
  taxAlreadyPaid: amount("Tax already paid"),

  declaration: checkbox.refine((ticked) => ticked, "You must confirm the declaration before submitting"),
});

/** Cross-field rules run once every individual field is valid. */
export const taxReturnSchema = taxReturnFields.superRefine((v, ctx) => {
  if (v.spouseRelief && v.maritalStatus !== "married") {
    ctx.addIssue({
      code: "custom",
      path: ["spouseRelief"],
      message: "Spouse relief is only available to married taxpayers",
    });
  }
});

/** Just the fields needed to estimate tax — no identity, no declaration. */
export const taxEstimateSchema = taxReturnFields.pick({
  residency: true,
  maritalStatus: true,
  employmentIncome: true,
  businessIncome: true,
  rentalIncome: true,
  otherIncome: true,
  retirementContributions: true,
  medicalExpenses: true,
  lifestyleExpenses: true,
  childrenCount: true,
  spouseRelief: true,
  taxAlreadyPaid: true,
});

export type TaxReturnInput = z.infer<typeof taxReturnSchema>;
export type FieldErrors = Partial<Record<keyof TaxReturnInput, string[]>>;

export function fieldErrorsOf(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}
