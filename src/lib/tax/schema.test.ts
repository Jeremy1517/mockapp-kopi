import { describe, expect, it } from "vitest";
import { fieldErrorsOf, taxReturnSchema } from "./schema";

/** Shaped like `Object.fromEntries(new FormData(form))` — all strings. */
const validForm = {
  fullName: "Alex Tan",
  taxId: "sg1234567890",
  email: "alex@example.com",
  phone: "",
  taxYear: "2025",
  residency: "resident",
  maritalStatus: "single",
  employmentIncome: "60000",
  businessIncome: "",
  rentalIncome: "",
  otherIncome: "",
  retirementContributions: "7000",
  medicalExpenses: "",
  lifestyleExpenses: "",
  childrenCount: "0",
  taxAlreadyPaid: "1000.50",
  declaration: "on",
};

const errorsFor = (overrides: Record<string, unknown>) => {
  const result = taxReturnSchema.safeParse({ ...validForm, ...overrides });
  return result.success ? {} : fieldErrorsOf(result.error);
};

describe("taxReturnSchema", () => {
  it("coerces form strings into typed values", () => {
    const data = taxReturnSchema.parse(validForm);
    expect(data.taxId).toBe("SG1234567890");
    expect(data.taxYear).toBe(2025);
    expect(data.employmentIncome).toBe(60_000);
    expect(data.businessIncome).toBe(0);
    expect(data.taxAlreadyPaid).toBe(1000.5);
    expect(data.spouseRelief).toBe(false);
    expect(data.declaration).toBe(true);
  });

  it("requires the declaration", () => {
    expect(errorsFor({ declaration: undefined }).declaration).toBeDefined();
  });

  it("rejects malformed Tax IDs", () => {
    expect(errorsFor({ taxId: "12345" }).taxId).toBeDefined();
  });

  it("rejects years that are not open for filing", () => {
    expect(errorsFor({ taxYear: "2019" }).taxYear).toBeDefined();
  });

  it("rejects negative amounts and more than 2 decimal places", () => {
    expect(errorsFor({ rentalIncome: "-1" }).rentalIncome).toBeDefined();
    expect(errorsFor({ otherIncome: "10.123" }).otherIncome).toBeDefined();
  });

  it("rejects spouse relief for single taxpayers", () => {
    expect(errorsFor({ spouseRelief: "on" }).spouseRelief).toBeDefined();
    expect(errorsFor({ spouseRelief: "on", maritalStatus: "married" }).spouseRelief).toBeUndefined();
  });

  it("accepts JSON-style booleans and numbers (REST API)", () => {
    const result = taxReturnSchema.safeParse({
      ...validForm,
      taxYear: 2024,
      employmentIncome: 50_000,
      declaration: true,
    });
    expect(result.success).toBe(true);
  });
});
