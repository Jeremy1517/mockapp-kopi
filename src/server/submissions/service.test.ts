import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSubmission, listSubmissions, submitTaxReturn } from "./service";

const payload = {
  fullName: "Alex Tan",
  taxId: "SG1234567890",
  email: "alex@example.com",
  taxYear: 2025,
  residency: "resident",
  maritalStatus: "single",
  employmentIncome: 60_000,
  retirementContributions: 7_000,
  taxAlreadyPaid: 1_500,
  declaration: true,
};

describe("submitTaxReturn", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "kopi-tax-"));
    process.env.DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  it("validates, computes on the server and persists the return", async () => {
    const result = await submitTaxReturn(payload);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.submission.reference).toMatch(/^KT-2025-[0-9A-F]{8}$/);
    expect(result.submission.computation.taxPayable).toBe(1_140);
    expect(result.submission.computation.outcome).toBe("refund");

    expect(await getSubmission(result.submission.id)).toEqual(result.submission);
    expect(await listSubmissions()).toHaveLength(1);
  });

  it("returns field errors for invalid input and stores nothing", async () => {
    const result = await submitTaxReturn({ ...payload, email: "nope", declaration: false });
    expect(result).toMatchObject({ ok: false, kind: "validation" });
    if (result.ok) return;
    expect(result.fieldErrors.email).toBeDefined();
    expect(result.fieldErrors.declaration).toBeDefined();
    expect(await listSubmissions()).toHaveLength(0);
  });

  it("rejects a second return for the same Tax ID and year", async () => {
    expect((await submitTaxReturn(payload)).ok).toBe(true);

    const duplicate = await submitTaxReturn({ ...payload, taxId: "sg1234567890" });
    expect(duplicate).toMatchObject({ ok: false, kind: "conflict" });

    // A different year is a separate return.
    expect((await submitTaxReturn({ ...payload, taxYear: 2024 })).ok).toBe(true);
    expect(await listSubmissions()).toHaveLength(2);
  });

  it("does not create duplicates under concurrent submissions", async () => {
    const results = await Promise.all([submitTaxReturn(payload), submitTaxReturn(payload), submitTaxReturn(payload)]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(await listSubmissions()).toHaveLength(1);
  });
});
