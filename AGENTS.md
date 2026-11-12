<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project notes

- Mock inventory app for a coffee shop. The shelf holds only ingredients a recipe uses; `catalog.test.ts` fails if one isn't.
- Ingredients live only in `src/lib/coffee/ingredients.ts`, recipes (amounts, layers, steps) only in `src/lib/coffee/recipes.ts`.
- `src/lib/coffee/stock.ts` is pure — keep I/O out of it and cover changes in `stock.test.ts`.
- Every stock change goes through `logBrew`, `logDelivery` or `logCount` in `src/server/pantry/service.ts`; the Server Actions (`src/app/actions.ts`) and the `POST /api/*` routes both call them.
- Cache Components is on: uncached reads (the JSON store, `searchParams`) must sit inside `<Suspense>`.
- Run `npm run check` (lint + typecheck + tests) before committing.
