"use client";

import {
  startTransition,
  useActionState,
  useMemo,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from "react";
import { fileTaxReturn, type FileReturnState } from "@/app/file/actions";
import { formatNumber } from "@/lib/format";
import { calculateTax, type TaxInput } from "@/lib/tax/calculate";
import { MAX_CHILDREN, RELIEFS, TAX_YEARS } from "@/lib/tax/rules";
import { fieldErrorsOf, taxReturnSchema, type FieldErrors } from "@/lib/tax/schema";
import { TaxBreakdown } from "./tax-breakdown";
import { Card, Field, buttonClass, cx, inputClass } from "./ui";

interface Values {
  fullName: string;
  taxId: string;
  email: string;
  phone: string;
  taxYear: string;
  residency: "resident" | "non_resident";
  maritalStatus: "single" | "married";
  employmentIncome: string;
  businessIncome: string;
  rentalIncome: string;
  otherIncome: string;
  retirementContributions: string;
  medicalExpenses: string;
  lifestyleExpenses: string;
  childrenCount: string;
  spouseRelief: boolean;
  taxAlreadyPaid: string;
  declaration: boolean;
}
type Name = keyof Values;

const EMPTY: Values = {
  fullName: "",
  taxId: "",
  email: "",
  phone: "",
  taxYear: String(TAX_YEARS[0]),
  residency: "resident",
  maritalStatus: "single",
  employmentIncome: "",
  businessIncome: "",
  rentalIncome: "",
  otherIncome: "",
  retirementContributions: "",
  medicalExpenses: "",
  lifestyleExpenses: "",
  childrenCount: "0",
  spouseRelief: false,
  taxAlreadyPaid: "",
  declaration: false,
};

function sampleValues(): Values {
  const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
  return {
    ...EMPTY,
    fullName: "Alex Tan Wei Ming",
    taxId: `SG${digits}`,
    email: "alex.tan@example.com",
    phone: "+60 12-345 6789",
    maritalStatus: "married",
    employmentIncome: "96000",
    rentalIncome: "14400",
    otherIncome: "850",
    retirementContributions: "10560",
    medicalExpenses: "1200",
    lifestyleExpenses: "3100",
    childrenCount: "2",
    spouseRelief: true,
    taxAlreadyPaid: "6800",
  };
}

const INITIAL_STATE: FileReturnState = { fieldErrors: {} };

const toNumber = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

/** Lenient conversion for the live estimate — validation happens on submit. */
const toTaxInput = (v: Values): TaxInput => ({
  residency: v.residency,
  maritalStatus: v.maritalStatus,
  employmentIncome: toNumber(v.employmentIncome),
  businessIncome: toNumber(v.businessIncome),
  rentalIncome: toNumber(v.rentalIncome),
  otherIncome: toNumber(v.otherIncome),
  retirementContributions: toNumber(v.retirementContributions),
  medicalExpenses: toNumber(v.medicalExpenses),
  lifestyleExpenses: toNumber(v.lifestyleExpenses),
  childrenCount: toNumber(v.childrenCount),
  spouseRelief: v.spouseRelief,
  taxAlreadyPaid: toNumber(v.taxAlreadyPaid),
});

export function TaxReturnForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [state, formAction, pending] = useActionState(fileTaxReturn, INITIAL_STATE);

  // Errors are local so they can be cleared field-by-field as the user edits.
  // When the server responds with a new state, adopt its errors.
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | undefined>();
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    setErrors(state.fieldErrors);
    setMessage(state.message);
  }

  const estimate = useMemo(() => calculateTax(toTaxInput(values)), [values]);
  const isResident = values.residency === "resident";

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target;
    const name = target.name as Name;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;

    setValues((prev) => {
      const next = { ...prev, [name]: value } as Values;
      if (name === "maritalStatus" && value !== "married") next.spouseRelief = false;
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    // Validate in the browser with the same schema the server uses, then call
    // the Server Action ourselves (this also avoids React's automatic form reset).
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const parsed = taxReturnSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      const fieldErrors = fieldErrorsOf(parsed.error);
      setErrors(fieldErrors);
      setMessage("Please correct the highlighted fields.");
      const first = Array.from(form.elements).find(
        (el): el is HTMLInputElement => "name" in el && (el as HTMLInputElement).name in fieldErrors,
      );
      first?.focus();
      return;
    }

    setMessage(undefined);
    startTransition(() => formAction(formData));
  }

  const err = (name: Name) => errors[name]?.[0];
  const bind = (name: Name) => ({
    id: name,
    name,
    onChange: handleChange,
    "aria-invalid": err(name) ? true : undefined,
    "aria-describedby": err(name) ? `${name}-error` : undefined,
  });
  const text = (name: Name) => ({ ...bind(name), value: values[name] as string });

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-kopi-300 bg-kopi-50 px-4 py-3 text-sm text-kopi-900">
          <span>Just exploring? Prefill the form with a sample taxpayer.</span>
          <button
            type="button"
            className={buttonClass("secondary")}
            onClick={() => {
              setValues(sampleValues());
              setErrors({});
              setMessage(undefined);
            }}
          >
            Use sample data
          </button>
        </div>

        <Card step={1} title="Taxpayer details" description="As they appear on your identity document.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="fullName" label="Full name" error={err("fullName")} className="sm:col-span-2">
              <input {...text("fullName")} autoComplete="name" className={inputClass(!!err("fullName"))} />
            </Field>
            <Field id="taxId" label="Tax ID" hint="2 letters + 10 digits, e.g. SG1234567890" error={err("taxId")}>
              <input
                {...text("taxId")}
                autoComplete="off"
                placeholder="SG1234567890"
                className={cx(inputClass(!!err("taxId")), "uppercase")}
              />
            </Field>
            <Field id="taxYear" label="Year of assessment" error={err("taxYear")}>
              <select {...text("taxYear")} className={inputClass(!!err("taxYear"))}>
                {TAX_YEARS.map((y) => (
                  <option key={y} value={y}>
                    YA {y}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="email" label="Email" error={err("email")}>
              <input {...text("email")} type="email" autoComplete="email" className={inputClass(!!err("email"))} />
            </Field>
            <Field id="phone" label="Phone (optional)" error={err("phone")}>
              <input {...text("phone")} type="tel" autoComplete="tel" className={inputClass(!!err("phone"))} />
            </Field>
            <Field id="residency" label="Residency status" error={err("residency")}>
              <select {...text("residency")} className={inputClass(!!err("residency"))}>
                <option value="resident">Resident</option>
                <option value="non_resident">Non-resident</option>
              </select>
            </Field>
            <Field id="maritalStatus" label="Marital status" error={err("maritalStatus")}>
              <select {...text("maritalStatus")} className={inputClass(!!err("maritalStatus"))}>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </Field>
          </div>
        </Card>

        <Card step={2} title="Income" description="Total income received during the year of assessment.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="employmentIncome" label="Employment income" hint="Salary, bonus, allowances" error={err("employmentIncome")}>
              <MoneyInput {...text("employmentIncome")} invalid={!!err("employmentIncome")} />
            </Field>
            <Field id="businessIncome" label="Business income" hint="Net profit from a business" error={err("businessIncome")}>
              <MoneyInput {...text("businessIncome")} invalid={!!err("businessIncome")} />
            </Field>
            <Field id="rentalIncome" label="Rental income" error={err("rentalIncome")}>
              <MoneyInput {...text("rentalIncome")} invalid={!!err("rentalIncome")} />
            </Field>
            <Field id="otherIncome" label="Other income" hint="Interest, royalties, etc." error={err("otherIncome")}>
              <MoneyInput {...text("otherIncome")} invalid={!!err("otherIncome")} />
            </Field>
          </div>
        </Card>

        <Card
          step={3}
          title="Reliefs"
          description={
            isResident
              ? `Individual relief of ${formatNumber(RELIEFS.individual)} is applied automatically. Claims above a cap are reduced to the cap.`
              : "Non-residents are taxed at a flat rate and cannot claim reliefs."
          }
        >
          <fieldset disabled={!isResident} className="grid gap-4 disabled:opacity-60 sm:grid-cols-2">
            <Field
              id="retirementContributions"
              label="Retirement & life insurance"
              hint={`Capped at ${formatNumber(RELIEFS.retirementCap)}`}
              error={err("retirementContributions")}
            >
              <MoneyInput {...text("retirementContributions")} invalid={!!err("retirementContributions")} />
            </Field>
            <Field
              id="medicalExpenses"
              label="Medical expenses"
              hint={`Capped at ${formatNumber(RELIEFS.medicalCap)}`}
              error={err("medicalExpenses")}
            >
              <MoneyInput {...text("medicalExpenses")} invalid={!!err("medicalExpenses")} />
            </Field>
            <Field
              id="lifestyleExpenses"
              label="Lifestyle purchases"
              hint={`Books, devices, internet — capped at ${formatNumber(RELIEFS.lifestyleCap)}`}
              error={err("lifestyleExpenses")}
            >
              <MoneyInput {...text("lifestyleExpenses")} invalid={!!err("lifestyleExpenses")} />
            </Field>
            <Field
              id="childrenCount"
              label="Number of children"
              hint={`${formatNumber(RELIEFS.perChild)} per child, up to ${MAX_CHILDREN}`}
              error={err("childrenCount")}
            >
              <input
                {...text("childrenCount")}
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_CHILDREN}
                step={1}
                className={inputClass(!!err("childrenCount"))}
              />
            </Field>
            <div className="sm:col-span-2">
              <Checkbox
                {...bind("spouseRelief")}
                checked={values.spouseRelief}
                disabled={values.maritalStatus !== "married"}
                error={err("spouseRelief")}
              >
                Claim spouse relief ({formatNumber(RELIEFS.spouse)}) — my spouse had no income this year
              </Checkbox>
            </div>
          </fieldset>
        </Card>

        <Card step={4} title="Tax already paid" description="Monthly deductions withheld by your employer and any instalments.">
          <Field id="taxAlreadyPaid" label="Total tax paid / withheld" error={err("taxAlreadyPaid")} className="sm:max-w-xs">
            <MoneyInput {...text("taxAlreadyPaid")} invalid={!!err("taxAlreadyPaid")} />
          </Field>
        </Card>

        <Card step={5} title="Declaration">
          <Checkbox {...bind("declaration")} checked={values.declaration} error={err("declaration")}>
            I declare that the information in this return is true, correct and complete.
          </Checkbox>

          {message && (
            <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200">
              {message}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className={buttonClass("secondary")}
              onClick={() => {
                setValues(EMPTY);
                setErrors({});
                setMessage(undefined);
              }}
            >
              Clear form
            </button>
            <button type="submit" disabled={pending} className={buttonClass("primary")}>
              {pending ? "Submitting…" : "Submit return"}
            </button>
          </div>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card title="Live estimate" description="Updates as you type. Final figures are computed on submission.">
          <TaxBreakdown computation={estimate} />
        </Card>
      </aside>
    </form>
  );
}

function MoneyInput({ invalid, ...props }: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-stone-400">
        RM
      </span>
      <input
        {...props}
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        placeholder="0.00"
        className={cx(inputClass(invalid), "pl-11 tabular-nums")}
      />
    </div>
  );
}

function Checkbox({
  error,
  children,
  ...props
}: ComponentProps<"input"> & { error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-sm text-stone-700 has-disabled:cursor-not-allowed has-disabled:opacity-60">
        <input
          {...props}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 rounded border-stone-300 accent-kopi-700"
        />
        <span>{children}</span>
      </label>
      {error && (
        <p id={`${props.id}-error`} className="mt-1.5 pl-7 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
