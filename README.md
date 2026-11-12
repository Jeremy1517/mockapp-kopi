# Kopi Counter — mock coffee-shop inventory

A mock full-stack **Next.js** app for a small coffee shop: what's on the shelf, how to make every
drink on the menu, and a log of what was made and delivered. Built for demos and practice.

- **Shelf** — the seven ingredients the menu uses, drawn as containers filled to their stock level,
  with a dashed reorder line. Log a delivery or a physical count from here. Below it, the menu shows
  how many more cups of each drink the shelf can make and which ingredient runs out first.
- **Recipes** — eleven drinks (espresso, Americano, macchiato, cortado, flat white, cappuccino, latte,
  mocha, caramel macchiato, kopi and kopi O kosong). Each recipe page plays its method step by step
  while the cup fills layer by layer. Log cups made and their ingredients come off the shelf.
- **Bar log** — every brew, delivery and count, newest first.

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
  app/
    page.tsx                  Shelf + cups left
    recipes/page.tsx          The menu
    recipes/[slug]/page.tsx   One recipe: animated pour, method, log cups made
    log/page.tsx              Bar log
    actions.ts                Server Actions → pantry service
    api/…                     REST: pantry, brews, deliveries, counts
  components/
    cup-drawing.tsx           Cross-section of a drink, layer by layer
    pour-stage.tsx            Plays a recipe's steps and pours the cup
    vessel.tsx                A container on the shelf
    shelf.tsx                 The shelf, delivery and count forms
  lib/coffee/
    ingredients.ts            ← everything the shelf holds
    recipes.ts                ← every drink: amounts, layers, steps
    stock.ts                  Pure stock maths (cups left, consume, levels)
    schema.ts                 Zod schemas for brew, delivery and count
  server/pantry/
    service.ts                The only way stock changes (server-only)
    repository.ts             Persistence: a JSON file, or Firestore (server-only)
demo-datasets/                Starting states for Previews
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
within one Node process, which is fine locally.

If `DATA_PATH` is set, the app keeps the same data in Firestore instead: one document,
`<DATA_PATH>/pantry/0000`, in the database named by `FIRESTORE_DATABASE`. Both stores are in
`src/server/pantry/repository.ts`.

## Previews

G-Unit Test runs a live copy of a branch, called a Preview, on Cloud Run. It needs three things
from this repository:

- **A ticket key in the branch name**, in upper case, for example `feat/GUT-12-oat-milk`.
- **`Dockerfile`** — builds the app and starts it on `PORT`.
- **`demo-datasets/`** — each JSON file is one starting state that a Preview can begin with.
  The file has the shape `{ "pantry": [ { "stock": { … }, "log": [ … ] } ] }`. G-Unit Test copies
  it into Firestore and sets `DATA_PATH` and `FIRESTORE_DATABASE`, so each Preview has its own shelf.

To add a starting state, add a file to `demo-datasets/`. An ingredient that the file leaves out
gets its opening stock.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, tests and a production build on
every push to `main` and on pull requests.
