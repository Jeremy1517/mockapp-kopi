import type { IngredientId } from "./ingredients";

/** What you see in the cup, bottom to top. */
export type LayerKind =
  "espresso" | "water" | "milk" | "foam" | "chocolate" | "vanilla" | "caramel" | "kopi" | "condensed";

export type CupKind = "demitasse" | "gibraltar" | "cup" | "mug" | "tall-glass" | "kopitiam";

export interface Recipe {
  slug: string;
  name: string;
  /** For sentences like "Made 1 latte" and "Made 3 lattes". */
  count: { one: string; other: string };
  blurb: string;
  cup: CupKind;
  /** Taken from the shelf for every cup made. */
  uses: { ingredient: IngredientId; amount: number }[];
  /** Goes in the cup but isn't kept on the shelf. */
  untracked?: { name: string; amount: string }[];
  /** Drawn bottom to top. `caramel` is a drizzle on top, not a band. */
  layers: { kind: LayerKind; ml: number }[];
  /** In order. A step that `adds` a layer pours it in the drawing. */
  steps: { text: string; adds?: LayerKind }[];
}

const pullDouble = (into: string) => [
  { text: "Grind 18 g of beans and level them in the basket." },
  { text: "Tamp flat and firm, then lock the portafilter in." },
  { text: `Pull a 36 g double shot into ${into} in 25 to 30 seconds.`, adds: "espresso" as const },
];

export const RECIPES: readonly Recipe[] = [
  {
    slug: "espresso",
    name: "Espresso",
    count: { one: "espresso", other: "espressos" },
    blurb: "A short, thick double shot with a lid of crema. Everything else on the menu starts here.",
    cup: "demitasse",
    uses: [{ ingredient: "espresso-beans", amount: 18 }],
    layers: [{ kind: "espresso", ml: 36 }],
    steps: [...pullDouble("a warm demitasse"), { text: "Serve straight away, before the crema fades." }],
  },
  {
    slug: "americano",
    name: "Americano",
    count: { one: "Americano", other: "Americanos" },
    blurb: "A double shot stretched long with hot water. Clean, light and easy to drink.",
    cup: "mug",
    uses: [{ ingredient: "espresso-beans", amount: 18 }],
    untracked: [{ name: "Hot water", amount: "200 ml" }],
    layers: [
      { kind: "espresso", ml: 36 },
      { kind: "water", ml: 200 },
    ],
    steps: [
      ...pullDouble("the mug"),
      { text: "Top up with 200 ml of water just off the boil, around 90 °C.", adds: "water" },
    ],
  },
  {
    slug: "macchiato",
    name: "Macchiato",
    count: { one: "macchiato", other: "macchiatos" },
    blurb: "An espresso marked with a spoonful of foam to take the edge off.",
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
      ...pullDouble("a demitasse"),
      { text: "Steam a splash of milk until it's stiff and foamy." },
      { text: "Spoon a dollop of foam onto the middle of the shot.", adds: "foam" },
    ],
  },
  {
    slug: "cortado",
    name: "Cortado",
    count: { one: "cortado", other: "cortados" },
    blurb: "Equal parts espresso and warm milk, served small in a Gibraltar glass.",
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
      ...pullDouble("a Gibraltar glass"),
      { text: "Steam 60 ml of milk with barely any air." },
      { text: "Pour it in until milk and espresso are one to one.", adds: "milk" },
      { text: "Let a thin layer of foam settle on top.", adds: "foam" },
    ],
  },
  {
    slug: "flat-white",
    name: "Flat white",
    count: { one: "flat white", other: "flat whites" },
    blurb: "A double shot under a thin, glossy microfoam. Stronger than a latte, smoother than a cortado.",
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
      ...pullDouble("the cup"),
      { text: "Steam 120 ml of milk to a thin microfoam that shines like paint." },
      { text: "Pour low and fast so the milk folds under the crema.", adds: "milk" },
      { text: "Finish with a small heart, no more than 5 mm of foam.", adds: "foam" },
    ],
  },
  {
    slug: "cappuccino",
    name: "Cappuccino",
    count: { one: "cappuccino", other: "cappuccinos" },
    blurb: "Espresso, steamed milk and a deep cap of foam in roughly equal thirds.",
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
      ...pullDouble("a warmed cup"),
      { text: "Steam 130 ml of milk, letting in air until it grows by a third." },
      { text: "Pour the milk in, holding the foam back with a spoon.", adds: "milk" },
      { text: "Spoon the foam on top to make a cap about 1.5 cm deep.", adds: "foam" },
    ],
  },
  {
    slug: "latte",
    name: "Latte",
    count: { one: "latte", other: "lattes" },
    blurb: "A double shot in a tall glass of steamed milk, finished with a centimetre of foam.",
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
      ...pullDouble("a tall glass"),
      { text: "Steam 220 ml of milk to 60–65 °C with a little foam." },
      { text: "Pour the milk in a steady stream down the middle.", adds: "milk" },
      { text: "Finish with about 1 cm of foam.", adds: "foam" },
    ],
  },
  {
    slug: "mocha",
    name: "Mocha",
    count: { one: "mocha", other: "mochas" },
    blurb: "A latte with chocolate sauce stirred into the shot. Rich, sweet, and always a hit.",
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
      { text: "Pump 25 g of chocolate sauce into the mug.", adds: "chocolate" },
      { text: "Grind 18 g of beans, tamp and lock in." },
      { text: "Pull the double shot over the chocolate and stir until smooth.", adds: "espresso" },
      { text: "Steam 180 ml of milk and pour it in.", adds: "milk" },
      { text: "Top with a layer of foam.", adds: "foam" },
    ],
  },
  {
    slug: "caramel-macchiato",
    name: "Caramel macchiato",
    count: { one: "caramel macchiato", other: "caramel macchiatos" },
    blurb: "Vanilla milk marked with espresso and finished with a crosshatch of caramel.",
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
      { text: "Pump 15 ml of vanilla syrup into a tall glass.", adds: "vanilla" },
      { text: "Steam 220 ml of milk and pour it in, holding back the foam.", adds: "milk" },
      { text: "Pour a 36 g double shot slowly through the middle so it sits on the milk.", adds: "espresso" },
      { text: "Spoon the foam over the top.", adds: "foam" },
      { text: "Drizzle 10 g of caramel across it in a crosshatch.", adds: "caramel" },
    ],
  },
  {
    slug: "kopi",
    name: "Kopi",
    count: { one: "kopi", other: "kopi" },
    blurb: "Kopitiam-style coffee: dark-roasted kopi pulled through a sock over sweet condensed milk.",
    cup: "kopitiam",
    uses: [
      { ingredient: "condensed-milk", amount: 30 },
      { ingredient: "kopi-powder", amount: 20 },
    ],
    untracked: [{ name: "Boiling water", amount: "200 ml" }],
    layers: [
      { kind: "condensed", ml: 26 },
      { kind: "kopi", ml: 180 },
    ],
    steps: [
      { text: "Spoon 30 g of condensed milk into a warm kopitiam cup.", adds: "condensed" },
      { text: "Put 20 g of kopi powder in the sock and pour over 200 ml of boiling water." },
      { text: "Pull the kopi between two pots two or three times to air it." },
      { text: "Strain it into the cup over the condensed milk.", adds: "kopi" },
      { text: "Serve with a spoon so the customer can stir it in." },
    ],
  },
  {
    slug: "kopi-o-kosong",
    name: "Kopi O kosong",
    count: { one: "kopi O kosong", other: "kopi O kosong" },
    blurb: "Black kopi with nothing added: no condensed milk and no sugar, so the dark roast does the talking.",
    cup: "kopitiam",
    uses: [{ ingredient: "kopi-powder", amount: 20 }],
    untracked: [{ name: "Boiling water", amount: "200 ml" }],
    layers: [{ kind: "kopi", ml: 190 }],
    steps: [
      { text: "Warm a kopitiam cup with a splash of boiling water, then empty it." },
      { text: "Put 20 g of kopi powder in the sock and pour over 200 ml of boiling water." },
      { text: "Pull the kopi between two pots two or three times to air it." },
      { text: "Strain it into the cup.", adds: "kopi" },
    ],
  },
];

const bySlug = new Map(RECIPES.map((r) => [r.slug, r]));

export const getRecipe = (slug: string): Recipe | undefined => bySlug.get(slug);

/** Recipes that use an ingredient, in menu order. */
export const recipesUsing = (id: IngredientId): Recipe[] =>
  RECIPES.filter((r) => r.uses.some((u) => u.ingredient === id));
