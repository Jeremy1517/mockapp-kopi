<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project notes

- Mock income-tax e-filing app. Rates, caps and open years live only in `src/lib/tax/rules.ts`.
- `src/lib/tax/calculate.ts` is a pure function — keep I/O out of it and cover changes in `calculate.test.ts`.
- All filing rules go through `submitTaxReturn()` in `src/server/submissions/service.ts`; both the Server Action and `POST /api/submissions` call it.
- Cache Components is on: uncached reads (the JSON store, `params`) must sit inside `<Suspense>`.
- Run `npm run check` (lint + typecheck + tests) before committing.
