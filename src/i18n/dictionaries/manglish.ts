import { MAX_COUNT, MAX_CUPS_PER_LOG, MAX_PACKS_PER_DELIVERY } from "@/lib/coffee/limits";
import type { Dictionary } from "./en";

/**
 * Manglish: Malaysian English, the way it's spoken over the counter. Same keys
 * as English; the wording stays clear enough to run a shop on.
 */
export const manglish: Dictionary = {
  meta: {
    title: "Kopi Counter",
    description: "Stock, resipi and buku 555 for your small kopi shop. Mock app only lah.",
  },
  nav: { label: "Main", shelf: "Rak", recipes: "Resipi", log: "Buku 555" },
  header: { darkMode: "Dark mode", language: "Bahasa" },
  languages: { en: "English", manglish: "Manglish" },
  footer: "Mock app only ah. Stock and buku 555 all keep in this computer only.",
  and: "and",
  units: { g: "gram", ml: "ml" },
  stepper: { fewer: "Kurang one", more: "Tambah one" },

  shelf: {
    title: "On the shelf",
    intro:
      "All the barang your menu need, nothing extra one. Tekan any one to log stock masuk or count balance. The red dotted line means time to order liao.",
    loading: "Loading the rak",
    allGood: "Everything still got enough, steady lah.",
    belowOne: (name: string) => `${name} running low already, go order lah.`,
    belowMany: (names: string) => `${names} all running low already, go order lah.`,
    tagReorder: "Order liao",
    tagOut: "Habis",
    onShelf: "on the rak",
    out: "Habis already. Every drink that need this one cannot sell lah.",
    low: (amount: string) => `Below the order line (${amount}) liao.`,
    ok: (amount: string) => `Order again when drop below ${amount}.`,
    usedIn: "Use in",
    arrivesIn: (size: string, packs: string) => `Supplier send in ${size} ${packs}.`,
    delivery: {
      title: "Stock masuk",
      hint: (size: string, packs: string) => `Count how many ${size} ${packs} sampai.`,
      received: (packs: string) => `How many ${packs} came`,
      add: (what: string) => `Add ${what}`,
      adding: "Adding ah…",
    },
    count: {
      title: "Count balance",
      hint: "Weigh or measure how much really got. This one will replace the number on the rak.",
      label: (unit: string) => `How many ${unit}`,
      save: "Save count",
      saving: "Saving ah…",
    },
  },

  cupsBoard: {
    title: "Can make how many cup",
    intro: "Before something habis, each drink still can make how many cup.",
    runsOutFirst: (name: string) => `${name} will habis first`,
    outOf: (name: string) => `${name} habis already`,
    cupsLeft: "cup can make",
  },

  recipes: {
    title: "Resipi",
    intro:
      "Every drink on the menu, measure per cup so every cup taste the same. Open one and see how to make, step by step.",
    checking: "Checking the rak…",
    none: "Cannot make right now",
    left: (n: number) => `Still can make ${n} cup`,
  },

  recipe: {
    all: "All resipi",
    whatGoesIn: "Put what inside",
    perCup: "For one cup.",
    fromTap: "(from the tap, no need keep on rak)",
    method: "How to make",
    ready: "Siap, can serve liao",
    gettingReady: "Getting the cup ready",
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    pourAgain: "Pour again",
    startOver: "Start again from step 1",
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
      water: "air panas",
      milk: "steamed milk",
      foam: "foam",
      chocolate: "choc",
      vanilla: "vanilla syrup",
      caramel: "caramel",
      kopi: "kopi",
      condensed: "susu pekat",
    },
    describeCup: (name: string, cup: string, layers: string) => `${name} in ${cup}: ${layers}, bottom to top`,
  },

  brew: {
    title: "Log cup made",
    cantMake: (one: string, ingredient: string) => `Cannot make ${one} already: ${ingredient} habis liao.`,
    logDelivery: "Log stock masuk",
    enoughLead: "Rak still got enough for",
    more: (n: number) => `${n} more cup`,
    runsOutFirst: (ingredient: string) =>
      `${ingredient} will habis first. Once you log, the barang auto take out from the rak.`,
    cupsMade: "How many cup",
    log: (what: string) => `Log ${what}`,
    logging: "Logging ah…",
  },

  log: {
    title: "Buku 555",
    intro: "Every cup, every stock masuk, every count, all write down here. Newest on top.",
    emptyTitle: "Still empty lah",
    emptyBody: "Log stock masuk or count balance from the rak, or log cup made from any resipi.",
    goShelf: "Go to rak",
    openRecipe: "Open resipi",
    made: (what: string) => `Made ${what}`,
    used: (list: string) => `Use ${list}.`,
    received: (packs: string, ingredient: string) => `Got ${packs} ${ingredient} masuk`,
    added: (amount: string) => `Add ${amount} to the rak.`,
    counted: (amount: string, ingredient: string) => `Count ${ingredient}: ${amount}`,
    matched: "Same as what the rak expect, steady.",
    off: (amount: string, less: boolean) =>
      less ? `Kurang ${amount} from what the rak expect.` : `Lebih ${amount} from what the rak expect.`,
  },

  notFound: {
    title: "Alamak, no such page",
    body: "This page or resipi don't have lah. Maybe change name already.",
    recipes: "See all resipi",
    shelf: "Go back to rak",
  },

  messages: {
    logged: (what: string) => `Okay, logged ${what} liao.`,
    added: (packs: string, ingredient: string) => `Okay, added ${packs} ${ingredient}.`,
    counted: (amount: string, ingredient: string) => `Saved liao: ${ingredient} got ${amount} on the rak.`,
    short: (ingredient: string, what: string, need: string, have: string) =>
      `Not enough ${ingredient} for ${what} lah: need ${need} but rak only got ${have}.`,
    checkField: "Check the red one first.",
  },

  errors: {
    pickDrink: "Choose a drink from the menu lah.",
    cupsMissing: "How many cup you made?",
    cupsWhole: "Cup must be whole number lah.",
    cupsMin: "At least 1 cup leh.",
    cupsMax: `Max ${MAX_CUPS_PER_LOG} cup one time only.`,
    pickIngredient: "Choose something from the rak lah.",
    packsMissing: "How many came?",
    packsWhole: "Whole number only ah.",
    packsMin: "At least add 1 lah.",
    packsMax: `Max ${MAX_PACKS_PER_DELIVERY} one time only.`,
    amountMissing: "Key in how much you counted.",
    amountMin: "Cannot below zero one lah.",
    amountMax: `So much ah? One rak cannot fit. Key in ${MAX_COUNT} or less.`,
  },
};
