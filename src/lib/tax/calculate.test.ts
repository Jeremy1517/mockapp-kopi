import { describe, expect, it } from "vitest";
import { calculateTax, type TaxInput } from "./calculate";

const base: TaxInput = {
  residency: "resident",
  maritalStatus: "single",
  employmentIncome: 0,
  businessIncome: 0,
  rentalIncome: 0,
  otherIncome: 0,
  retirementContributions: 0,
  medicalExpenses: 0,
  lifestyleExpenses: 0,
  childrenCount: 0,
  spouseRelief: false,
  taxAlreadyPaid: 0,
};

const tax = (overrides: Partial<TaxInput>) => calculateTax({ ...base, ...overrides });

describe("calculateTax", () => {
  it("returns a nil outcome when there is no income", () => {
    const c = tax({});
    expect(c.grossIncome).toBe(0);
    expect(c.chargeableIncome).toBe(0);
    expect(c.taxPayable).toBe(0);
    expect(c.outcome).toBe("nil");
    expect(c.effectiveRate).toBe(0);
  });

  it("applies the individual relief automatically to residents", () => {
    const c = tax({ employmentIncome: 12_000 });
    expect(c.totalReliefs).toBe(9_000);
    expect(c.chargeableIncome).toBe(3_000);
    expect(c.taxPayable).toBe(0);
  });

  it("taxes progressively across bands and caps over-claimed reliefs", () => {
    // Reliefs: 9,000 individual + 7,000 retirement (8,000 claimed, capped) = 16,000
    // Chargeable: 60,000 - 16,000 = 44,000
    // Tax: 0 + 150 + 450 + 540 = 1,140 (no rebate — above 35,000)
    const c = tax({ employmentIncome: 60_000, retirementContributions: 8_000 });
    const retirement = c.reliefs.find((r) => r.key === "retirement");
    expect(retirement).toMatchObject({ claimed: 8_000, allowed: 7_000 });
    expect(c.chargeableIncome).toBe(44_000);
    expect(c.taxBeforeRebate).toBe(1_140);
    expect(c.rebate).toBe(0);
    expect(c.taxPayable).toBe(1_140);
  });

  it("grants the low-income rebate at or below the threshold", () => {
    // Chargeable 31,000 → tax 150 + 330 = 480 → less 400 rebate = 80
    const c = tax({ employmentIncome: 40_000 });
    expect(c.chargeableIncome).toBe(31_000);
    expect(c.taxBeforeRebate).toBe(480);
    expect(c.rebate).toBe(400);
    expect(c.taxPayable).toBe(80);
  });

  it("never lets the rebate push tax below zero", () => {
    // Chargeable 16,000 → tax 110 → rebate limited to 110
    const c = tax({ employmentIncome: 25_000 });
    expect(c.taxBeforeRebate).toBe(110);
    expect(c.rebate).toBe(110);
    expect(c.taxPayable).toBe(0);
  });

  it("only grants spouse relief to married taxpayers", () => {
    expect(tax({ employmentIncome: 50_000, spouseRelief: true }).totalReliefs).toBe(9_000);
    expect(
      tax({ employmentIncome: 50_000, spouseRelief: true, maritalStatus: "married" }).totalReliefs,
    ).toBe(13_000);
  });

  it("gives child relief per child", () => {
    const c = tax({ employmentIncome: 50_000, childrenCount: 3 });
    expect(c.reliefs.find((r) => r.key === "children")?.allowed).toBe(6_000);
  });

  it("taxes non-residents at a flat 30% with no reliefs or rebate", () => {
    const c = tax({ residency: "non_resident", employmentIncome: 20_000, medicalExpenses: 5_000 });
    expect(c.reliefs).toHaveLength(0);
    expect(c.chargeableIncome).toBe(20_000);
    expect(c.taxPayable).toBe(6_000);
  });

  it("reaches the top band for very high incomes", () => {
    // Chargeable 2,500,000 → sum of every band = 678,400
    const c = tax({ employmentIncome: 2_509_000 });
    expect(c.chargeableIncome).toBe(2_500_000);
    expect(c.taxPayable).toBe(678_400);
    expect(c.bands.at(-1)).toMatchObject({ rate: 0.3, taxableAmount: 500_000 });
  });

  it("reports a refund when more tax was withheld than is payable", () => {
    const c = tax({ employmentIncome: 60_000, retirementContributions: 7_000, taxAlreadyPaid: 1_500 });
    expect(c.taxPayable).toBe(1_140);
    expect(c.balance).toBe(-360);
    expect(c.outcome).toBe("refund");
  });

  it("reports a balance payable when too little was withheld", () => {
    const c = tax({ employmentIncome: 60_000, retirementContributions: 7_000, taxAlreadyPaid: 1_000 });
    expect(c.balance).toBe(140);
    expect(c.outcome).toBe("payable");
  });

  it("sums income from every source", () => {
    const c = tax({ employmentIncome: 1_000.5, businessIncome: 2_000.25, rentalIncome: 300, otherIncome: 0.25 });
    expect(c.grossIncome).toBe(3_301);
  });
});
