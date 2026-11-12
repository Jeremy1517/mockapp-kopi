# Kopi Counter — mock coffee-shop inventory

A mock full-stack **Next.js** app for a small coffee shop: what's on the shelf, how to make every
drink on the menu, and a log of what was made and delivered. Built for demos and practice.

- **Shelf** — the seven ingredients the menu uses, drawn as containers filled to their stock level,
  with a dashed reorder line. Log a delivery or a physical count from here. Below it, the menu shows
  how many more cups of each drink the shelf can make and which ingredient runs out first.
- **Recipes** — ten drinks (espresso, Americano, macchiato, cortado, flat white, cappuccino, latte,
  mocha, caramel macchiato and kopi). Each recipe page plays its method step by step while the cup
  fills layer by layer. Log cups made and their ingredients come off the shelf.
- **Bar log** — every brew, delivery and count, newest first.

All text on the site is written in **English** and **Manglish**, and every page lives under its
language (`/en/recipes`, `/manglish/recipes`). Light and dark themes share two greens, `#2b3b2c`
and `#e8eedf`, swapped between modes.

Both are **switched off for now**:

- Picking **Manglish** moves the switch, but the page stays in English, and `/manglish/...`
  redirects to English. Add `"manglish"` to `ENABLED_LOCALES` in `src/i18n/config.ts` to turn it
  on; the switch then reloads the same page in Manglish and remembers the choice.
- The **dark mode** button is hidden from the header (`SHOW_THEME_TOGGLE` in `src/lib/theme.ts`).
  When shown, it flips its moon/sun icon but the page stays light, whatever the system setting.
  Set `DARK_MODE_ENABLED` to `true` there to turn dark mode on; the theme then follows the
  system until someone picks one, and the choice is saved in the browser.

The shelf holds ingredients only — no cups, lids or pastries — and only ones a recipe needs.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI | React 19, Tailwind CSS 4, hand-drawn SVG, CSS transitions |
| Validation | Zod 4 |
| Tests | Vitest |
| Runtime | Node.js 24 (`.nvmrc`), minimum 20.9 |

## Getting started

```bash
nvm use            # optional — Node 24
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Unit tests (catalogue, stock maths, service) |
| `npm run check` | lint + typecheck + test (what CI runs before building) |

## Project structure

```
src/
  proxy.ts                    Adds the language to bare URLs (/recipes → /en/recipes)
  app/
    [lang]/layout.tsx         Root layout: <html lang>, theme script, header
    [lang]/page.tsx           Shelf + cups left
    [lang]/recipes/…          The menu, and one recipe with its animated pour
    [lang]/log/page.tsx       Bar log
    actions.ts                Server Actions → pantry service
    api/…                     REST: pantry, brews, deliveries, counts
  i18n/
    config.ts                 Locales, URL helpers, the Localized type
    dictionaries/en.ts        ← every piece of interface text
    dictionaries/manglish.ts  Same keys, in Manglish
    server.ts / client.tsx    Read the locale in Server / Client Components
  components/
    cup-drawing.tsx           Cross-section of a drink, layer by layer
    pour-stage.tsx            Plays a recipe's steps and pours the cup
    vessel.tsx                A container on the shelf
    shelf.tsx                 The shelf, delivery and count forms
  lib/coffee/
    ingredients.ts            ← everything the shelf holds (names in both languages)
    recipes.ts                ← every drink: amounts, layers, steps (text in both languages)
    stock.ts                  Pure stock maths (cups left, consume, levels)
    schema.ts                 Zod schemas for brew, delivery and count
  server/pantry/
    service.ts                The only way stock changes (server-only)
    repository.ts             JSON-file persistence (server-only)
```

## Stock rules

1. Amounts are kept in grams or millilitres. Hot and boiling water come from the tap and aren't tracked.
2. **Brew:** logging cups takes every ingredient for every cup off the shelf, all or nothing. If the
   shelf can't cover them the brew is rejected (HTTP 409) and nothing changes.
3. **Delivery:** whole packs (a 1 kg bag, a 2 L bottle, a 500 g tin…) are added to the shelf.
4. **Count:** a physical count replaces what the shelf thought it had; the log keeps the difference.
5. An ingredient below its reorder point is flagged **Reorder**; at zero it's **Out**.
6. **Cups left** for a drink is the smallest whole number of cups any of its ingredients can cover.

## API

```bash
curl localhost:3000/api/pantry                       # stock, cups left per drink, bar log
# Add ?lang=manglish to any API URL for Manglish names and messages.

curl -X POST localhost:3000/api/brews -H 'content-type: application/json' \
  -d '{"recipe":"latte","cups":2}'                   # 201, 422 invalid, 409 not enough stock

curl -X POST localhost:3000/api/deliveries -H 'content-type: application/json' \
  -d '{"ingredient":"espresso-beans","packs":3}'

curl -X POST localhost:3000/api/counts -H 'content-type: application/json' \
  -d '{"ingredient":"fresh-milk","amount":8400}'
```

## Data storage

Stock and the log are written to `.data/pantry.json` (git-ignored; override the folder with
`DATA_DIR`). Delete the file to start again from opening stock. Writes are atomic and serialised
within one Node process, which is fine locally; for anything shared, replace
`src/server/pantry/repository.ts` with a real database.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, tests and a production build on
every push to `main` and on pull requests.
