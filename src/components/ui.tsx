import type { ReactNode } from "react";

export const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade";

export const buttonClass = (variant: "primary" | "quiet" = "primary") =>
  cx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    focus,
    variant === "primary"
      ? "bg-jade text-on-jade hover:bg-jade-deep"
      : "border-2 border-jade/25 text-jade hover:border-jade hover:bg-porcelain",
  );

export const inputClass = (invalid?: boolean) =>
  cx(
    "block h-11 w-full min-w-0 rounded-lg border-2 bg-porcelain px-3 text-base text-ink outline-none transition-colors",
    "focus:border-jade",
    invalid ? "border-chili" : "border-tile",
  );

/** Page title in sign lettering, with an optional plain-language intro. */
export function PageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-10 max-w-2xl">
      <h1 className="font-sign text-4xl leading-[1.05] text-jade sm:text-5xl">{title}</h1>
      {children && <div className="mt-4 text-lg leading-relaxed text-ink-soft">{children}</div>}
    </div>
  );
}

/** A short inline result line under a form. */
export function Notice({ tone, children, id }: { tone: "done" | "error"; children: ReactNode; id?: string }) {
  return (
    <p
      id={id}
      role={tone === "error" ? "alert" : "status"}
      className={cx("mt-3 text-sm font-medium", tone === "error" ? "text-chili" : "text-jade")}
    >
      {children}
    </p>
  );
}
