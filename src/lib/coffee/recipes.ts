import type { Localized } from "@/i18n/config";
import type { IngredientId } from "./ingredients";

/** What you see in the cup, bottom to top. */
export type LayerKind =
  "espresso" | "water" | "milk" | "foam" | "chocolate" | "vanilla" | "caramel" | "kopi" | "condensed";

export type CupKind = "demitasse" | "gibraltar" | "cup" | "mug" | "tall-glass" | "kopitiam";

export interface Recipe {
  slug: string;
  name: Localized;
  /** For sentences like "Made 1 latte" and "Made 3 lattes". */
  count: { one: Localized; other: Localized };
  blurb: Localized;
  cup: CupKind;
  /** Taken from the shelf for every cup made. */
  uses: { ingredient: IngredientId; amount: number }[];
  /** Goes in the cup but isn't kept on the shelf. */
  untracked?: { name: Localized; amount: string }[];
  /** Drawn bottom to top. `caramel` is a drizzle on top, not a band. */
  layers: { kind: LayerKind; ml: number }[];
  /** In order. A step that `adds` a layer pours it in the drawing. */
  steps: { text: Localized; adds?: LayerKind }[];
}

/** Same word in every language (drink names mostly). */
const same = (text: string): Localized => ({ en: text, manglish: text });

const pullDouble = (into: Localized) => [
  {
    text: {
      en: "Grind 18 g of beans and level them in the basket.",
      manglish: "Grind 18 g beans, then level nicely in the basket.",
    },
  },
  {
    text: {
      en: "Tamp flat and firm, then lock the portafilter in.",
      manglish: "Tamp flat flat, press firm, then lock in the portafilter.",
    },
  },
  {
    text: {
      en: `Pull a 36 g double shot into ${into.en} in 25 to 30 seconds.`,
      manglish: `Pull 36 g double shot into ${into.manglish}, 25 to 30 seconds can liao.`,
    },
    adds: "espresso" as const,
  },
];

export const RECIPES: readonly Recipe[] = [
  {
    slug: "espresso",
    name: same("Espresso"),
    count: { one: same("espresso"), other: { en: "espressos", manglish: "espresso" } },
    blurb: {
      en: "A short, thick double shot with a lid of crema. Everything else on the menu starts here.",
      manglish:
        "Short short, thick thick, got crema on top one. Every other drink on the menu start from here lah.",
    },
    cup: "demitasse",
    uses: [{ ingredient: "espresso-beans", amount: 18 }],
    layers: [{ kind: "espresso", ml: 36 }],
    steps: [
      ...pullDouble({ en: "a warm demitasse", manglish: "a warm demitasse" }),
      {
        text: {
          en: "Serve straight away, before the crema fades.",
          manglish: "Serve terus, don't wait until the crema go flat.",
        },
      },
    ],
  },
  {
    slug: "americano",
    name: same("Americano"),
    count: { one: same("Americano"), other: { en: "Americanos", manglish: "Americano" } },
    blurb: {
      en: "A double shot stretched long with hot water. Clean, light and easy to drink.",
      manglish: "Double shot add hot water, become long long. Light, clean, easy to drink one.",
    },
    cup: "mug",
    uses: [{ ingredient: "espresso-beans", amount: 18 }],
    untracked: [{ name: { en: "Hot water", manglish: "Air panas" }, amount: "200 ml" }],
    layers: [
      { kind: "espresso", ml: 36 },
      { kind: "water", ml: 200 },
    ],
    steps: [
      ...pullDouble({ en: "the mug", manglish: "the mug" }),
      {
        text: {
          en: "Top up with 200 ml of water just off the boil, around 90 °C.",
          manglish: "Top up 200 ml hot water, around 90 °C, just after boil, don't too hot.",
        },
        adds: "water",
      },
    ],
  },
  {
    slug: "macchiato",
    name: same("Macchiato"),
    count: { one: same("macchiato"), other: { en: "macchiatos", manglish: "macchiato" } },
    blurb: {
      en: "An espresso marked with a spoonful of foam to take the edge off.",
      manglish: "Espresso with one spoon of foam on top, so not so garang.",
    },
    cup: "demitasse",
    uses: [
      { ingredient: "espresso-beans", amount: 18 },
      { ingredient: "fresh-milk", amount: 30 },
    ],
    layers: [
      { kind: "espresso", ml: 36 },
      { kind: "foam", ml: 22 },
    ],
    steps: [
      ...pullDouble({ en: "a demitasse", manglish: "a demitasse" }),
      {
        text: {
          en: "Steam a splash of milk until it's stiff and foamy.",
          manglish: "Steam sikit milk until the foam stiff stiff.",
        },
      },
      {
        text: {
          en: "Spoon a dollop of foam onto the middle of the shot.",
          manglish: "Scoop one dollop foam, put in the middle of the shot.",
        },
        adds: "foam",
      },
    ],
  },
  {
    slug: "cortado",
    name: same("Cortado"),
    count: { one: same("cortado"), other: { en: "cortados", manglish: "cortado" } },
    blurb: {
      en: "Equal parts espresso and warm milk, served small in a Gibraltar glass.",
      manglish: "Half espresso half warm milk, small small one, serve in Gibraltar glass.",
    },
    cup: "gibraltar",
    uses: [
      { ingredient: "espresso-beans", amount: 18 },
      { ingredient: "fresh-milk", amount: 60 },
    ],
    layers: [
      { kind: "espresso", ml: 36 },
      { kind: "milk", ml: 44 },
      { kind: "foam", ml: 14 },
    ],
    steps: [
      ...pullDouble({ en: "a Gibraltar glass", manglish: "a Gibraltar glass" }),
      {
        text: {
          en: "Steam 60 ml of milk with barely any air.",
          manglish: "Steam 60 ml milk, don't put so much air.",
        },
      },
      {
        text: {
          en: "Pour it in until milk and espresso are one to one.",
          manglish: "Pour in until milk and espresso same same, one to one.",
        },
        adds: "milk",
      },
      {
        text: {
          en: "Let a thin layer of foam settle on top.",
          manglish: "Let one thin layer of foam sit on top.",
        },
        adds: "foam",
      },
    ],
  },
  {
    slug: "flat-white",
    name: same("Flat white"),
    count: { one: same("flat white"), other: { en: "flat whites", manglish: "flat white" } },
    blurb: {
      en: "A double shot under a thin, glossy microfoam. Stronger than a latte, smoother than a cortado.",
      manglish: "Double shot under thin, shiny microfoam. More kaw than latte, more smooth than cortado.",
    },
    cup: "cup",
    uses: [
      { ingredient: "espresso-beans", amount: 18 },
      { ingredient: "fresh-milk", amount: 120 },
    ],
    layers: [
      { kind: "espresso", ml: 36 },
      { kind: "milk", ml: 110 },
      { kind: "foam", ml: 10 },
    ],
    steps: [
      ...pullDouble({ en: "the cup", manglish: "the cup" }),
      {
        text: {
          en: "Steam 120 ml of milk to a thin microfoam that shines like paint.",
          manglish: "Steam 120 ml milk until the microfoam shiny like wet paint.",
        },
      },
      {
        text: {
          en: "Pour low and fast so the milk folds under the crema.",
          manglish: "Pour low and fast, let the milk go under the crema.",
        },
        adds: "milk",
      },
      {
        text: {
          en: "Finish with a small heart, no more than 5 mm of foam.",
          manglish: "Finish with small heart, foam not more than 5 mm ah.",
        },
        adds: "foam",
      },
    ],
  },
  {
    slug: "cappuccino",
    name: same("Cappuccino"),
    count: { one: same("cappuccino"), other: { en: "cappuccinos", manglish: "cappuccino" } },
    blurb: {
      en: "Espresso, steamed milk and a deep cap of foam in roughly equal thirds.",
      manglish: "Espresso, steamed milk and thick foam on top, more or less one third each.",
    },
    cup: "cup",
    uses: [
      { ingredient: "espresso-beans", amount: 18 },
      { ingredient: "fresh-milk", amount: 130 },
    ],
    layers: [
      { kind: "espresso", ml: 36 },
      { kind: "milk", ml: 66 },
      { kind: "foam", ml: 66 },
    ],
    steps: [
      ...pullDouble({ en: "a warmed cup", manglish: "a warm cup" }),
      {
        text: {
          en: "Steam 130 ml of milk, letting in air until it grows by a third.",
          manglish: "Steam 130 ml milk, let air in until it grow one third bigger.",
        },
      },
      {
        text: {
          en: "Pour the milk in, holding the foam back with a spoon.",
          manglish: "Pour the milk in, use spoon block the foam first.",
        },
        adds: "milk",
      },
      {
        text: {
          en: "Spoon the foam on top to make a cap about 1.5 cm deep.",
          manglish: "Scoop the foam on top, make a cap around 1.5 cm thick.",
        },
        adds: "foam",
      },
    ],
  },
  {
    slug: "latte",
    name: same("Latte"),
    count: { one: same("latte"), other: { en: "lattes", manglish: "latte" } },
    blurb: {
      en: "A double shot in a tall glass of steamed milk, finished with a centimetre of foam.",
      manglish: "Double shot in tall glass of steamed milk, one centimetre foam on top.",
    },
    cup: "tall-glass",
    uses: [
      { ingredient: "espresso-beans", amount: 18 },
      { ingredient: "fresh-milk", amount: 220 },
    ],
    layers: [
      { kind: "espresso", ml: 36 },
      { kind: "milk", ml: 200 },
      { kind: "foam", ml: 26 },
    ],
    steps: [
      ...pullDouble({ en: "a tall glass", manglish: "a tall glass" }),
      {
        text: {
          en: "Steam 220 ml of milk to 60–65 °C with a little foam.",
          manglish: "Steam 220 ml milk to 60–65 °C, sikit foam only.",
        },
      },
      {
        text: {
          en: "Pour the milk in a steady stream down the middle.",
          manglish: "Pour the milk steady steady down the middle.",
        },
        adds: "milk",
      },
      {
        text: { en: "Finish with about 1 cm of foam.", manglish: "Finish with around 1 cm foam." },
        adds: "foam",
      },
    ],
  },
  {
    slug: "mocha",
    name: same("Mocha"),
    count: { one: same("mocha"), other: { en: "mochas", manglish: "mocha" } },
    blurb: {
      en: "A latte with chocolate sauce stirred into the shot. Rich, sweet, and always a hit.",
      manglish: "Latte with choc sauce stir into the shot. Rich, sweet, sure sell one.",
    },
    cup: "mug",
    uses: [
      { ingredient: "chocolate-sauce", amount: 25 },
      { ingredient: "espresso-beans", amount: 18 },
      { ingredient: "fresh-milk", amount: 180 },
    ],
    layers: [
      { kind: "chocolate", ml: 22 },
      { kind: "espresso", ml: 36 },
      { kind: "milk", ml: 170 },
      { kind: "foam", ml: 24 },
    ],
    steps: [
      {
        text: {
          en: "Pump 25 g of chocolate sauce into the mug.",
          manglish: "Pump 25 g choc sauce into the mug.",
        },
        adds: "chocolate",
      },
      {
        text: { en: "Grind 18 g of beans, tamp and lock in.", manglish: "Grind 18 g beans, tamp, lock in." },
      },
      {
        text: {
          en: "Pull the double shot over the chocolate and stir until smooth.",
          manglish: "Pull the double shot on top of the choc, stir until smooth smooth.",
        },
        adds: "espresso",
      },
      {
        text: { en: "Steam 180 ml of milk and pour it in.", manglish: "Steam 180 ml milk, pour in." },
        adds: "milk",
      },
      {
        text: { en: "Top with a layer of foam.", manglish: "Top with one layer of foam." },
        adds: "foam",
      },
    ],
  },
  {
    slug: "caramel-macchiato",
    name: same("Caramel macchiato"),
    count: {
      one: same("caramel macchiato"),
      other: { en: "caramel macchiatos", manglish: "caramel macchiato" },
    },
    blurb: {
      en: "Vanilla milk marked with espresso and finished with a crosshatch of caramel.",
      manglish: "Vanilla milk, espresso on top, then caramel zig-zag. Sweet tooth confirm like.",
    },
    cup: "tall-glass",
    uses: [
      { ingredient: "vanilla-syrup", amount: 15 },
      { ingredient: "fresh-milk", amount: 220 },
      { ingredient: "espresso-beans", amount: 18 },
      { ingredient: "caramel-sauce", amount: 10 },
    ],
    layers: [
      { kind: "vanilla", ml: 15 },
      { kind: "milk", ml: 196 },
      { kind: "espresso", ml: 36 },
      { kind: "foam", ml: 30 },
      { kind: "caramel", ml: 0 },
    ],
    steps: [
      {
        text: {
          en: "Pump 15 ml of vanilla syrup into a tall glass.",
          manglish: "Pump 15 ml vanilla syrup into tall glass.",
        },
        adds: "vanilla",
      },
      {
        text: {
          en: "Steam 220 ml of milk and pour it in, holding back the foam.",
          manglish: "Steam 220 ml milk, pour in, block the foam first.",
        },
        adds: "milk",
      },
      {
        text: {
          en: "Pour a 36 g double shot slowly through the middle so it sits on the milk.",
          manglish: "Pour 36 g double shot slowly slowly in the middle, let it sit on the milk.",
        },
        adds: "espresso",
      },
      {
        text: { en: "Spoon the foam over the top.", manglish: "Scoop the foam on top." },
        adds: "foam",
      },
      {
        text: {
          en: "Drizzle 10 g of caramel across it in a crosshatch.",
          manglish: "Drizzle 10 g caramel zig-zag across the top.",
        },
        adds: "caramel",
      },
    ],
  },
  {
    slug: "kopi",
    name: same("Kopi"),
    count: { one: same("kopi"), other: same("kopi") },
    blurb: {
      en: "Kopitiam-style coffee: dark-roasted kopi pulled through a sock over sweet condensed milk.",
      manglish: "Proper kopitiam kopi: dark roast, pull through the sock, on top of susu pekat. Shiok!",
    },
    cup: "kopitiam",
    uses: [
      { ingredient: "condensed-milk", amount: 30 },
      { ingredient: "kopi-powder", amount: 20 },
    ],
    untracked: [{ name: { en: "Boiling water", manglish: "Air mendidih" }, amount: "200 ml" }],
    layers: [
      { kind: "condensed", ml: 26 },
      { kind: "kopi", ml: 180 },
    ],
    steps: [
      {
        text: {
          en: "Spoon 30 g of condensed milk into a warm kopitiam cup.",
          manglish: "Scoop 30 g susu pekat into warm kopitiam cup.",
        },
        adds: "condensed",
      },
      {
        text: {
          en: "Put 20 g of kopi powder in the sock and pour over 200 ml of boiling water.",
          manglish: "Put 20 g kopi powder in the sock, pour 200 ml boiling water over.",
        },
      },
      {
        text: {
          en: "Pull the kopi between two pots two or three times to air it.",
          manglish: "Tarik the kopi between two pot, two three times, let it get air.",
        },
      },
      {
        text: {
          en: "Strain it into the cup over the condensed milk.",
          manglish: "Strain into the cup, on top of the susu pekat.",
        },
        adds: "kopi",
      },
      {
        text: {
          en: "Serve with a spoon so the customer can stir it in.",
          manglish: "Serve with spoon, let customer stir themself.",
        },
      },
    ],
  },
];

const bySlug = new Map(RECIPES.map((r) => [r.slug, r]));

export const getRecipe = (slug: string): Recipe | undefined => bySlug.get(slug);

/** Recipes that use an ingredient, in menu order. */
export const recipesUsing = (id: IngredientId): Recipe[] =>
  RECIPES.filter((r) => r.uses.some((u) => u.ingredient === id));
