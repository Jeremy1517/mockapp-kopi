"use client";

import { useI18n } from "@/i18n/client";
import { cx, inputClass } from "./ui";

/** A whole-number field with − and + buttons, big enough to hit behind a busy bar. */
export function Stepper({
  id,
  name,
  label,
  value,
  onChange,
  min,
  max,
  invalid,
  describedBy,
}: {
  id: string;
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  invalid?: boolean;
  describedBy?: string;
}) {
  const { t } = useI18n();
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));
  const button = cx(
    "flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-jade/25 text-xl font-bold text-jade transition-colors",
    "hover:border-jade disabled:opacity-40 disabled:hover:border-jade/25",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade",
  );

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={button}
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label={t.stepper.fewer}
        >
          −
        </button>
        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? min : clamp(Number(e.target.value)))}
          className={cx(inputClass(invalid), "w-16 text-center font-semibold")}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className={button}
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label={t.stepper.more}
        >
          +
        </button>
      </div>
    </div>
  );
}
