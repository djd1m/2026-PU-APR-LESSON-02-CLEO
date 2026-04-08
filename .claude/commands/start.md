---
description: Bootstrap cleo-rf project from documentation. Generates monorepo skeleton,
  all packages, Docker configs, database schema, core modules, and basic tests.
  $ARGUMENTS: optional flags --skip-tests, --skip-seed, --dry-run.
---

# /start $ARGUMENTS

## Purpose

One-command project generation from documentation → working monorepo with `docker compose up`.

## Prerequisites

- Documentation in `docs/` directory (SPARC output)
- CC toolkit in project root (CLAUDE.md, .claude/)
- Node.js 20+, Docker + Docker Compose installed
- Git initialized

## Process

### Phase 1: Foundation (sequential — everything depends on this)

1. **Read all project docs** to build full context:
   - `docs/Architecture.md` → monorepo structure, Docker Compose, tech stack
   - `docs/Specification.md` → data model, API endpoints, NFRs
   - `docs/Pseudocode.md` → core algorithms, business logic
   - `docs/Completion.md` → env config, deployment setup
   - `docs/PRD.md` → features, user personas (for README)
   - `docs/Refinement.md` → edge cases, testing strategy

2. **Generate root configs:**
   - `package.json` (workspaces: apps/*, packages/*)
   - `turbo.json` (Turborepo tasks)
   - `docker-compose.yml` (from Architecture.md — web, api, worker, postgres, redis)
   - `docker-compose.prod.yml` (from Completion.md)
   - `.env.example` (from Completion.md — AI_BASE_URL, AI_API_KEY, AI_MODEL_ID, DB_PASSWORD, JWT_SECRET)
   - `.gitignore` (node_modules, .env, dist, pgdata)
   - `tsconfig.base.json` (shared TypeScript config)

3. **Git commit:** `chore: project root configuration`

### Phase 2: Packages (parallel via Task tool)

Launch 4 parallel tasks:

#### Task A: packages/shared
Read and use as source:
- `docs/Pseudocode.md` → TypeScript types (User, Transaction, Upload, Analysis, ShareCard)
- `docs/Architecture.md` → shared constants, bank format configs

Generate:
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/types/index.ts` — all data types from Pseudocode.md
- `packages/shared/src/constants/categories.ts` — spending categories
- `packages/shared/src/constants/bank-formats.ts` — Sberbank, Tinkoff, Alfa configs
- `packages/shared/src/utils/date.ts` — date parsing utilities
- `packages/shared/src/utils/money.ts` — currency formatting

**Commit:** `feat(shared): types, constants, and utilities`

#### Task B: packages/db
Read and use as source:
- `docs/Pseudocode.md` → data structures → Drizzle schema
- `docs/Architecture.md` → ERD, indexes

Generate:
- `packages/db/package.json`
- `packages/db/drizzle.config.ts`
- `packages/db/src/schema/users.ts`
- `packages/db/src/schema/uploads.ts`
- `packages/db/src/schema/transactions.ts`
- `packages/db/src/schema/analyses.ts`
- `packages/db/src/schema/share-cards.ts`
- `packages/db/src/schema/index.ts` — re-exports
- `packages/db/src/index.ts` — db client + connection
- `packages/db/seed/index.ts` — test data seeding from test-data/*.csv

**Commit:** `feat(db): Drizzle schema and migrations`

#### Task C: apps/api
Read and use as source:
- `docs/Pseudocode.md` → API contracts (6 endpoints), algorithms
- `docs/Architecture.md` → Express routes, middleware
- `docs/Specification.md` → acceptance criteria, validation rules
- `docs/Refinement.md` → error handling strategy

Generate:
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/Dockerfile`
- `apps/api/src/index.ts` — Express app setup
- `apps/api/src/routes/auth.ts` — register, login, telegram
- `apps/api/src/routes/upload.ts` — CSV upload endpoint
- `apps/api/src/routes/analysis.ts` — get analysis results
- `apps/api/src/routes/roast.ts` — roast generation (rate-limited)
- `apps/api/src/routes/share.ts` — share card generation
- `apps/api/src/middleware/auth.ts` — JWT verification
- `apps/api/src/middleware/rate-limit.ts` — per-user rate limiting
- `apps/api/src/middleware/error-handler.ts` — centralized error handling
- `apps/api/src/services/csv-parser.ts` — multi-format CSV parser (from Pseudocode.md algorithm)
- `apps/api/src/services/categorizer.ts` — AI transaction categorization
- `apps/api/src/services/subscription-detector.ts` — recurring payment detection (from Pseudocode.md)
- `apps/api/src/queue/index.ts` — BullMQ queue setup
- `apps/api/src/queue/jobs.ts` — job definitions (analyze, roast, share-card)
- `apps/api/src/__tests__/csv-parser.test.ts` — CSV parser tests

**Commits:** `feat(api): Express server with routes and middleware`, `feat(api): CSV parser and subscription detector`

#### Task D: apps/web
Read and use as source:
- `docs/PRD.md` → features, user flows
- `docs/Specification.md` → user stories, UI requirements
- `docs/Architecture.md` → Next.js App Router structure

Generate:
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/Dockerfile`
- `apps/web/next.config.js`
- `apps/web/tailwind.config.ts`
- `apps/web/app/layout.tsx` — root layout with Tailwind
- `apps/web/app/page.tsx` — landing page
- `apps/web/app/(auth)/login/page.tsx` — login form
- `apps/web/app/(auth)/register/page.tsx` — registration form
- `apps/web/app/dashboard/page.tsx` — main dashboard
- `apps/web/app/upload/page.tsx` — CSV upload with drag & drop
- `apps/web/app/analysis/[id]/page.tsx` — analysis results + roast display
- `apps/web/components/chat/roast-message.tsx` — chat-style roast display
- `apps/web/components/charts/category-pie.tsx` — Recharts pie chart
- `apps/web/components/upload/csv-dropzone.tsx` — CSV upload dropzone
- `apps/web/components/share/share-card-preview.tsx` — share card preview
- `apps/web/lib/api.ts` — API client

**Commit:** `feat(web): Next.js frontend with upload, analysis, and roast UI`

### Phase 3: Integration (sequential)

1. **Install dependencies:** `npm install` (turborepo workspaces)
2. **Docker build:** `docker compose build`
3. **Start services:** `docker compose up -d`
4. **Database setup:**
   - `npx drizzle-kit push` (apply schema)
   - `npx ts-node packages/db/seed/index.ts` (seed test data)
5. **Health check:** `curl http://localhost:4000/api/health`
6. **Run tests:** `npx turbo test`
7. **Git commit:** `chore: verify docker integration`

### Phase 4: Finalize

1. Generate/update `README.md` with quick start instructions
2. Final git tag: `git tag v0.1.0-scaffold`
3. Push: `git push origin HEAD --tags`
4. Report summary

## Output

After /start completes:
```
cleo-rf/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── app/          # Pages (landing, auth, dashboard, upload, analysis)
│   │   ├── components/   # UI components (chat, charts, upload, share)
│   │   └── lib/          # API client
│   └── api/              # Express API
│       ├── src/routes/   # 5 route files
│       ├── src/services/ # CSV parser, categorizer, subscription detector
│       ├── src/middleware/# Auth, rate limit, error handler
│       └── src/queue/    # BullMQ job processing
├── packages/
│   ├── shared/           # Types, constants, utils
│   └── db/               # Drizzle schema, migrations, seed
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── turbo.json
└── package.json
```

## Flags

- `--skip-tests` — skip test file generation
- `--skip-seed` — skip database seeding
- `--dry-run` — show plan without executing

## Error Recovery

If a task fails mid-generation:
- All completed phases are committed to git
- Re-run `/start` — it detects existing files and skips completed phases
