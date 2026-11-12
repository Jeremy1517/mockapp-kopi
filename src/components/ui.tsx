import type { ReactNode } from "react";

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const inputClass = (invalid?: boolean) =>
  cx(
    "block w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 shadow-xs outline-none transition",
    "placeholder:text-stone-400 focus:ring-3 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400",
    invalid
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-stone-300 focus:border-kopi-500 focus:ring-kopi-100",
  );

export const buttonClass = (variant: "primary" | "secondary" = "primary") =>
  cx(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kopi-600 disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary"
      ? "bg-kopi-700 text-white shadow-sm hover:bg-kopi-800"
      : "border border-stone-300 bg-white text-stone-800 hover:bg-stone-100",
  );

export function Card({
  step,
  title,
  description,
  children,
  className,
}: {
  step?: number;
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6", className)}>
      {title && (
        <header className="mb-5 flex items-start gap-3">
          {step !== undefined && (
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-kopi-100 text-xs font-bold text-kopi-800">
              {step}
            </span>
          )}
          <div>
            <h2 className="text-base font-semibold text-stone-900">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-stone-500">{description}</p>}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-stone-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const badgeTones = {
  payable: "bg-amber-50 text-amber-800 ring-amber-200",
  refund: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  nil: "bg-stone-100 text-stone-700 ring-stone-200",
  info: "bg-kopi-50 text-kopi-800 ring-kopi-200",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        badgeTones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-kopi-600">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-stone-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
