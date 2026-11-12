"use client";

import Link from "next/link";
import { useActionState, useRef, useState, type Ref } from "react";
import { countAction, deliveryAction, type ActionState } from "@/app/actions";
import { INGREDIENTS, getIngredient, type IngredientId } from "@/lib/coffee/ingredients";
import { recipesUsing } from "@/lib/coffee/recipes";
import { MAX_PACKS_PER_DELIVERY } from "@/lib/coffee/schema";
import { fillOf, formatAmount, formatPacks, levelOf, type Stock } from "@/lib/coffee/stock";
import { Stepper } from "./stepper";
import { Notice, buttonClass, cx, inputClass } from "./ui";
import { VesselDrawing } from "./vessel";

const idle: ActionState = { status: "idle", seq: 0 };

export function Shelf({ stock, initial }: { stock: Stock; initial?: IngredientId }) {
  const firstLow = INGREDIENTS.find((i) => levelOf(i.id, stock[i.id]) !== "ok")?.id;
  const [selected, setSelected] = useState<IngredientId>(initial ?? firstLow ?? INGREDIENTS[0].id);
  const panel = useRef<HTMLElement>(null);

  function choose(id: IngredientId) {
    setSelected(id);
    const rect = panel.current?.getBoundingClientRect();
    if (rect && rect.top > window.innerHeight - 120) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.current?.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
    }
  }

  return (
    <>
      <div
        className="rounded-2xl border-2 border-tile px-2 pt-6 pb-5 sm:px-4"
        style={{
          backgroundColor: "#eaf2ed",
          backgroundImage:
            "linear-gradient(var(--color-tile) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--color-tile) 1.5px, transparent 1.5px)",
          backgroundSize: "34px 34px",
          backgroundPosition: "-1px -1px",
        }}
      >
        <ul className="grid grid-cols-4 gap-y-8 lg:grid-cols-7">
          {INGREDIENTS.map((ingredient) => {
            const amount = stock[ingredient.id];
            const level = levelOf(ingredient.id, amount);
            const active = ingredient.id === selected;
            return (
              <li key={ingredient.id}>
                <button
                  type="button"
                  onClick={() => choose(ingredient.id)}
                  aria-pressed={active}
                  aria-controls="shelf-panel"
                  className="group block w-full rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
                >
                  <span className="flex h-32 items-end justify-center px-1 sm:h-40">
                    <VesselDrawing
                      ingredient={ingredient}
                      fill={fillOf(ingredient.id, amount)}
                      reorderFill={fillOf(ingredient.id, ingredient.reorderAt)}
                      className={cx(
                        "h-full w-auto max-w-full transition-transform duration-300",
                        active ? "-translate-y-2" : "group-hover:-translate-y-1",
                      )}
                    />
                  </span>
                  {/* The shelf plank: neighbouring cells join into one board. */}
                  <span className="-mx-px block h-3 bg-jade" aria-hidden="true" />
                  <span className="-mx-px block h-1.5 bg-[#c6d9cf]" aria-hidden="true" />
                  <span
                    className={cx(
                      "mx-0.5 mt-2 block rounded-b-md border-t-4 px-1.5 pt-1.5 pb-2 transition-colors sm:mx-2 sm:px-2",
                      active
                        ? "border-kaya bg-kaya-soft"
                        : "border-jade/40 bg-porcelain group-hover:border-jade",
                    )}
                  >
                    <span className="block text-[13px] leading-tight font-semibold sm:text-sm">
                      {ingredient.name}
                    </span>
                    <span className="mt-0.5 block text-[15px] leading-tight font-bold whitespace-nowrap sm:font-sign sm:text-lg">
                      {formatAmount(amount, ingredient.unit)}
                    </span>
                    {level !== "ok" && (
                      <span className="mt-1.5 inline-block rounded-sm bg-chili px-1.5 py-px text-xs font-bold text-white">
                        {level === "out" ? "Out" : "Reorder"}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <IngredientPanel key={selected} id={selected} amount={stock[selected]} ref={panel} />
    </>
  );
}

function IngredientPanel({ id, amount, ref }: { id: IngredientId; amount: number; ref: Ref<HTMLElement> }) {
  const ingredient = getIngredient(id);
  const { unit, pack, reorderAt } = ingredient;
  const level = levelOf(id, amount);
  const usedIn = recipesUsing(id);

  return (
    <section
      ref={ref}
      id="shelf-panel"
      aria-labelledby="shelf-panel-title"
      className="mt-6 grid scroll-mt-6 gap-x-10 gap-y-8 rounded-2xl border-2 border-tile bg-porcelain p-5 sm:p-8 lg:grid-cols-[1.2fr_1fr_1fr]"
    >
      <div>
        <h2 id="shelf-panel-title" className="font-sign text-2xl text-jade">
          {ingredient.name}
        </h2>
        <p className="mt-2">
          <span className="font-sign text-4xl">{formatAmount(amount, unit)}</span>{" "}
          <span className="text-ink-soft">on the shelf</span>
        </p>
        <p className={cx("mt-3 font-medium", level === "ok" ? "text-ink-soft" : "text-chili")}>
          {level === "out"
            ? "Out of stock. Every drink that needs it is off the menu."
            : level === "low"
              ? `Below the reorder line of ${formatAmount(reorderAt, unit)}.`
              : `Reorder when it drops below ${formatAmount(reorderAt, unit)}.`}
        </p>
        <p className="mt-3 text-ink-soft">
          Used in{" "}
          {usedIn.map((r, i) => (
            <span key={r.slug}>
              {i > 0 && (i === usedIn.length - 1 ? " and " : ", ")}
              <Link
                href={`/recipes/${r.slug}`}
                className="font-medium text-jade underline decoration-jade/30 underline-offset-2 hover:decoration-jade"
              >
                {r.name}
              </Link>
            </span>
          ))}
          . Arrives in {formatAmount(pack.amount, unit)} {pack.other}.
        </p>
      </div>
      <DeliveryForm id={id} />
      <CountForm id={id} amount={amount} />
    </section>
  );
}

function DeliveryForm({ id }: { id: IngredientId }) {
  const [state, action, pending] = useActionState(deliveryAction, idle);
  const [packs, setPacks] = useState(1);
  const { pack, unit } = getIngredient(id);
  const error = state.fieldErrors?.packs?.[0];

  return (
    <form action={action} className="border-t-2 border-tile pt-6 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-8">
      <h3 className="text-lg font-semibold">Log a delivery</h3>
      <p className="mt-1 mb-4 text-sm text-ink-soft">
        Count the {formatAmount(pack.amount, unit)} {pack.other} that came in.
      </p>
      <input type="hidden" name="ingredient" value={id} />
      <Stepper
        id="delivery-packs"
        name="packs"
        label={`${pack.other[0].toUpperCase()}${pack.other.slice(1)} received`}
        value={packs}
        onChange={setPacks}
        min={1}
        max={MAX_PACKS_PER_DELIVERY}
        invalid={Boolean(error)}
        describedBy={state.message ? "delivery-result" : undefined}
      />
      <button type="submit" disabled={pending} className={cx(buttonClass(), "mt-4")}>
        {pending ? "Adding…" : `Add ${formatPacks(id, packs)}`}
      </button>
      {state.message && (
        <Notice key={state.seq} id="delivery-result" tone={state.status === "error" ? "error" : "done"}>
          {state.message}
        </Notice>
      )}
    </form>
  );
}

function CountForm({ id, amount }: { id: IngredientId; amount: number }) {
  const [state, action, pending] = useActionState(countAction, idle);
  const { unit } = getIngredient(id);
  const error = state.fieldErrors?.amount?.[0];
  // Controlled, so a rejected count keeps what was typed; follows the shelf when stock changes.
  const [value, setValue] = useState(String(amount));
  const [shown, setShown] = useState(amount);
  if (amount !== shown) {
    setShown(amount);
    setValue(String(amount));
  }

  return (
    <form action={action} className="border-t-2 border-tile pt-6 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-8">
      <h3 className="text-lg font-semibold">Record a count</h3>
      <p className="mt-1 mb-4 text-sm text-ink-soft">
        Weigh or measure what&apos;s really there. It replaces the number on the shelf.
      </p>
      <input type="hidden" name="ingredient" value={id} />
      <label htmlFor="count-amount" className="mb-1.5 block text-sm font-semibold">
        Amount in {unit === "g" ? "grams" : "millilitres"}
      </label>
      <div className="flex items-center gap-2">
        <input
          id="count-amount"
          name="amount"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cx(inputClass(Boolean(error)), "w-32 font-semibold")}
          aria-invalid={error ? true : undefined}
          aria-describedby={state.message ? "count-result" : undefined}
        />
        <span className="text-ink-soft">{unit}</span>
      </div>
      <button type="submit" disabled={pending} className={cx(buttonClass("quiet"), "mt-4")}>
        {pending ? "Saving…" : "Save count"}
      </button>
      {state.message && (
        <Notice key={state.seq} id="count-result" tone={state.status === "error" ? "error" : "done"}>
          {state.message}
        </Notice>
      )}
    </form>
  );
}
