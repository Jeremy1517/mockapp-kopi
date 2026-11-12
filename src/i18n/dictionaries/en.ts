import { MAX_COUNT, MAX_CUPS_PER_LOG, MAX_PACKS_PER_DELIVERY } from "@/lib/coffee/limits";
import type { ErrorKey } from "@/lib/coffee/schema";

/**
 * Every piece of interface text, in English. `Dictionary` is derived from this
 * object, so another language that misses or misspells a key won't compile.
 * Names that come from the catalogue (ingredients, recipes) live with the
 * catalogue in src/lib/coffee.
 */
export const en = {
  meta: {
    title: "Kopi Counter",
    description: "Stock, recipes and a bar log for a small coffee shop. A mock app.",
  },
  nav: { label: "Main", shelf: "Shelf", recipes: "Recipes", log: "Bar log" },
  header: { darkMode: "Dark mode", language: "Language" },
  languages: { en: "English", manglish: "Manglish" },
  footer: "A mock app. Stock and the bar log are saved on this computer only.",
  and: "and",
  units: { g: "grams", ml: "millilitres" },
  stepper: { fewer: "One fewer", more: "One more" },

  shelf: {
    title: "On the shelf",
    intro:
      "Every ingredient your menu is made from, and nothing else. Tap one to log a delivery or count what's left. The dashed red line on each container is where you reorder.",
    loading: "Loading the shelf",
    allGood: "Everything is above its reorder line.",
    belowOne: (name: string) => `${name} is below its reorder line.`,
    belowMany: (names: string) => `${names} are below their reorder lines.`,
    tagReorder: "Reorder",
    tagOut: "Out",
    onShelf: "on the shelf",
    out: "Out of stock. Every drink that needs it is off the menu.",
    low: (amount: string) => `Below the reorder line of ${amount}.`,
    ok: (amount: string) => `Reorder when it drops below ${amount}.`,
    usedIn: "Used in",
    arrivesIn: (size: string, packs: string) => `Arrives in ${size} ${packs}.`,
    delivery: {
      title: "Log a delivery",
      hint: (size: string, packs: string) => `Count the ${size} ${packs} that came in.`,
      received: (packs: string) => `${packs[0].toUpperCase()}${packs.slice(1)} received`,
      add: (what: string) => `Add ${what}`,
      adding: "Adding…",
    },
    count: {
      title: "Record a count",
      hint: "Weigh or measure what's really there. It replaces the number on the shelf.",
      label: (unit: string) => `Amount in ${unit}`,
      save: "Save count",
      saving: "Saving…",
    },
  },

  cupsBoard: {
    title: "Cups left",
    intro: "How many more of each drink the shelf can make before an ingredient runs out.",
    runsOutFirst: (name: string) => `${name} runs out first`,
    outOf: (name: string) => `Out of ${name}`,
    cupsLeft: "cups left",
  },

  recipes: {
    title: "Recipes",
    intro:
      "Every drink on the menu, measured per cup so each one comes out the same. Open a recipe to watch it come together step by step.",
    checking: "Checking the shelf…",
    none: "Can't make any right now",
    left: (n: number) => `${n} ${n === 1 ? "cup" : "cups"} left on the shelf`,
  },

  recipe: {
    all: "All recipes",
    whatGoesIn: "What goes in",
    perCup: "Per cup.",
    fromTap: "(from the tap, not kept on the shelf)",
    method: "Method",
    ready: "Ready to serve",
    gettingReady: "Getting the cup ready",
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    pourAgain: "Pour again",
    startOver: "Start from step 1",
    cups: {
      demitasse: "a demitasse",
      gibraltar: "a Gibraltar glass",
      cup: "a cup",
      mug: "a mug",
      "tall-glass": "a tall glass",
      kopitiam: "a kopitiam cup",
    },
    layers: {
      espresso: "espresso",
      water: "hot water",
      milk: "steamed milk",
      foam: "foam",
      chocolate: "chocolate",
      vanilla: "vanilla syrup",
      caramel: "caramel",
      kopi: "kopi",
      condensed: "condensed milk",
    },
    describeCup: (name: string, cup: string, layers: string) =>
      `${name} in ${cup}: ${layers}, from the bottom up`,
  },

  brew: {
    title: "Log cups made",
    cantMake: (one: string, ingredient: string) =>
      `The shelf can't make another ${one}: ${ingredient} has run out.`,
    logDelivery: "Log a delivery",
    enoughLead: "The shelf has enough for",
    more: (n: number) => `${n} more`,
    runsOutFirst: (ingredient: string) =>
      `${ingredient} runs out first. Logging takes the ingredients off the shelf.`,
    cupsMade: "Cups made",
    log: (what: string) => `Log ${what}`,
    logging: "Logging…",
  },

  log: {
    title: "Bar log",
    intro: "Every cup logged, delivery received and count taken, newest first.",
    emptyTitle: "Nothing logged yet",
    emptyBody: "Log a delivery or a count from the shelf, or log cups made from any recipe.",
    goShelf: "Go to the shelf",
    openRecipe: "Open a recipe",
    made: (what: string) => `Made ${what}`,
    used: (list: string) => `Used ${list}.`,
    received: (packs: string, ingredient: string) => `Received ${packs} of ${ingredient}`,
    added: (amount: string) => `Added ${amount} to the shelf.`,
    counted: (amount: string, ingredient: string) => `Counted ${amount} of ${ingredient}`,
    matched: "Matched what the shelf expected.",
    off: (amount: string, less: boolean) => `${amount} ${less ? "less" : "more"} than the shelf expected.`,
  },

  notFound: {
    title: "Not on the menu",
    body: "There's no page or recipe at this address. It may have been renamed.",
    recipes: "See all recipes",
    shelf: "Go to the shelf",
  },

  /** Results of changing stock, from the server. */
  messages: {
    logged: (what: string) => `Logged ${what}.`,
    added: (packs: string, ingredient: string) => `Added ${packs} of ${ingredient}.`,
    counted: (amount: string, ingredient: string) => `Saved: ${amount} of ${ingredient} on the shelf.`,
    short: (ingredient: string, what: string, need: string, have: string) =>
      `Not enough ${ingredient} for ${what}: they need ${need} and the shelf has ${have}.`,
    checkField: "Check the highlighted field.",
  },

  /** Form validation, keyed by `ErrorKey` in src/lib/coffee/schema.ts. */
  errors: {
    pickDrink: "Pick a drink from the menu.",
    cupsMissing: "Enter how many cups you made.",
    cupsWhole: "Cups must be a whole number.",
    cupsMin: "Log at least 1 cup.",
    cupsMax: `Log at most ${MAX_CUPS_PER_LOG} cups at a time.`,
    pickIngredient: "Pick an ingredient from the shelf.",
    packsMissing: "Enter how many arrived.",
    packsWhole: "Use a whole number.",
    packsMin: "Add at least 1.",
    packsMax: `Add at most ${MAX_PACKS_PER_DELIVERY} at a time.`,
    amountMissing: "Enter the amount you counted.",
    amountMin: "The amount can't be below zero.",
    amountMax: `That's more than one shelf holds. Enter ${MAX_COUNT} or less.`,
  } satisfies Record<ErrorKey, string>,
};

export type Dictionary = typeof en;
