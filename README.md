# KopiTax — mock income-tax e-filing

A mock full-stack **Next.js** application for submitting an individual income-tax return.
Built for demos, experiments and practice; the tax rules are illustrative, not official.

- **Frontend:** App Router pages, a multi-section form with a live tax estimate
- **Backend:** Server Action for the form, REST Route Handlers for API clients
- **Business logic:** a pure, unit-tested tax engine shared by browser and server
- **Persistence:** a JSON file on disk (swap for a real DB later; see below)

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI | React 19, Tailwind CSS 4 |
| Validation | Zod 4 (one schema, used client- and server-side) |
| Tests | Vitest |
| Runtime | Node.js 24 (`.nvmrc`), minimum 20.9 |

## Getting started

```bash
nvm use            # optional — Node 24
npm install
npm run dev        # http://localhost:3000
```

Open **File a return**, click **Use sample data**, tick the declaration and submit.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Unit tests (tax engine, schema, service) |
| `npm run check` | lint + typecheck + test (what CI runs before building) |

## Project structure

```
src/
  app/
    page.tsx                    Landing page
    file/page.tsx               Tax return form
    file/actions.ts             Server Action → submitTaxReturn()
    submissions/page.tsx        List of filed returns
    submissions/[id]/page.tsx   Acknowledgement / receipt
    api/submissions/…           REST: list, create, get by id
    api/tax/estimate/route.ts   REST: stateless calculator
  components/                   UI (form, breakdown, primitives)
  lib/
    tax/rules.ts                ← all rates, caps and open years live here
    tax/calculate.ts            Pure tax engine
    tax/schema.ts               Zod schema for a return
    format.ts                   Currency/date formatting
  server/submissions/
    service.ts                  Business rules for filing (server-only)
    repository.ts               JSON-file persistence (server-only)
```

## Business rules

All numbers come from `src/lib/tax/rules.ts`.

1. **Gross income** = employment + business + rental + other.
2. **Reliefs** (residents only): individual 9,000 (automatic), spouse 4,000 (married, spouse has
   no income), 2,000 per child (max 12), and capped claims — retirement/life insurance ≤ 7,000,
   medical ≤ 10,000, lifestyle ≤ 2,500.
3. **Chargeable income** = gross − reliefs (never below 0).
4. **Tax** is progressive across ten resident bands (0 % → 30 %). Non-residents pay a flat 30 %
   with no reliefs or rebate.
5. **Rebate:** 400 off when chargeable income ≤ 35,000 — never more than the tax itself.
6. **Balance** = tax payable − tax already paid → *balance payable*, *refund due* or *nil*.
7. **Filing rules:** only open years of assessment (2023–2025) are accepted, the declaration must be
   ticked, and **one return per Tax ID per year** — a duplicate is rejected (HTTP 409).

The browser validates with the same Zod schema for instant feedback, but the server re-validates
and **recomputes the tax itself**; client-side figures are never stored.

## API

```bash
# Estimate only (nothing stored)
curl -X POST localhost:3000/api/tax/estimate -H 'content-type: application/json' \
  -d '{"residency":"resident","maritalStatus":"single","employmentIncome":60000}'

# File a return → 201 Created (422 invalid, 409 duplicate)
curl -X POST localhost:3000/api/submissions -H 'content-type: application/json' -d '{
  "fullName":"Alex Tan","taxId":"SG1234567890","email":"alex@example.com",
  "taxYear":2025,"residency":"resident","maritalStatus":"single",
  "employmentIncome":60000,"taxAlreadyPaid":1500,"declaration":true}'

curl localhost:3000/api/submissions          # list (Tax IDs masked)
curl localhost:3000/api/submissions/<id>     # full record incl. computation
```

## Data storage

Submissions are written to `.data/submissions.json` (git-ignored; override the folder with
`DATA_DIR`). Writes are atomic and serialised within one Node process, which is fine locally.
For anything shared or serverless, replace `src/server/submissions/repository.ts` with a real
database — the service, pages and API don't need to change.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, tests and a production build on
every push to `main` and on pull requests.
