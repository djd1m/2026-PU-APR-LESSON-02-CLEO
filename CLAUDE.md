# cleo-rf — AI Financial Assistant for Gen Z Russia

## Project Overview

AI-powered personal finance assistant that analyzes bank CSV transactions and delivers insights through a personality-driven chatbot with "Roast Mode". Russian adaptation of Cleo AI ($280M+ ARR). Target: Gen Z (18-30) in Russia.

## Architecture

- **Pattern:** Distributed Monolith in Monorepo
- **Frontend:** Next.js 15 (App Router) + Tailwind + shadcn/ui + Recharts
- **API:** Express.js + TypeScript
- **Queue:** BullMQ + Redis
- **Database:** PostgreSQL 16 (Docker) + Drizzle ORM
- **AI:** OpenAI-compatible API (configurable base_url + model_id)
- **Deploy:** Docker Compose on VPS

## Monorepo Structure

```
apps/web/          → Next.js frontend (pages, components, lib)
apps/api/          → Express API (routes, services, middleware, queue)
packages/shared/   → Types, constants, utils (no business logic)
packages/db/       → Drizzle schema, migrations, seed
```

## Key Commands

### Development Lifecycle
- `/start` — Bootstrap project from docs (scaffold, Docker, DB)
- `/feature [name]` — Full 4-phase lifecycle: PLAN → VALIDATE → IMPLEMENT → REVIEW
- `/plan [task]` — Lightweight planning for simple tasks (<=3 files)
- `/next` — Show sprint progress, suggest next feature
- `/go [feature]` — Auto-select pipeline (/plan or /feature) and implement

### Automation
- `/run` or `/run mvp` — Bootstrap + implement all MVP features in a loop
- `/run all` — Bootstrap + implement ALL features
- `/docs` — Generate bilingual documentation (RU/EN) in README/
- `/deploy [env]` — Guided deployment (staging/production)

### Knowledge Management
- `/myinsights [title]` — Capture development insight (error-first lookup)
- `/harvest [mode]` — Extract reusable knowledge from project

### Command Hierarchy
```
/run mvp|all
  └── /start (bootstrap — if not done)
  └── LOOP:
      ├── /next (find next feature)
      └── /go <feature>
          ├── /plan (simple tasks, score <= -2)
          └── /feature (standard/complex features)
              ├── Phase 1: PLAN (sparc-prd-mini)
              ├── Phase 2: VALIDATE (requirements-validator)
              ├── Phase 3: IMPLEMENT (parallel agents)
              └── Phase 4: REVIEW (brutal-honesty-review)
```

## Feature Roadmap
Roadmap: [.claude/feature-roadmap.json](.claude/feature-roadmap.json) — single source of truth for feature status.
Sprint progress and next steps are injected automatically at session start.
Quick check: `/next` | Mark done: `/next [feature-id]` | Update: `/next update`

## Available Agents
- `@planner` — Break down features into tasks using SPARC docs
- `@code-reviewer` — Review code for quality, security, architecture compliance
- `@architect` — Guard architectural consistency and module boundaries

## Available Skills (in .claude/skills/)
- `sparc-prd-mini` — SPARC documentation generator (delegates to explore, goap-research, problem-solver)
- `requirements-validator` — INVEST + SMART validation, BDD scenario generation
- `brutal-honesty-review` — Code review with BS-detection
- `feature-navigator` — Sprint progress and feature suggestions
- `explore`, `goap-research-ed25519`, `problem-solver-enhanced` — Research and analysis

## Documentation
- `docs/PRD.md` — Product Requirements
- `docs/Architecture.md` — System Design, ERD, Tech Stack
- `docs/Specification.md` — User Stories + Gherkin ACs
- `docs/Pseudocode.md` — Algorithms, Data Structures, API Contracts
- `docs/Refinement.md` — Edge Cases, Testing, Security
- `docs/Completion.md` — Deployment, CI/CD, Monitoring
- `docs/adr/` — 10 Architectural Decision Records
- `docs/M2.5-cjm-variants.md` — CJM with 3 variants + comparison
- `docs/research/` — Fintech microtrends Russia 2025-2026

## ADR Index
| ADR | Decision |
|-----|----------|
| ADR-001 | Product name: cleo-rf |
| ADR-002 | Architecture: Distributed Monolith |
| ADR-003 | Database: PostgreSQL in Docker |
| ADR-004 | AI: OpenAI-compatible API (configurable) |
| ADR-005 | Input: CSV upload (MVP), Open Banking (v2) |
| ADR-006 | Monetization: Freemium 499 RUB/mo |
| ADR-007 | Regulatory: Information service |
| ADR-008 | CJM: "Roast First" variant |
| ADR-009 | Aha Moment: Roast + subscription detection |
| ADR-010 | Referral: Share cards |

## Test Data
`test-data/` contains 5 CSV scenarios for testing:
- `scenario-01-student-impulse.csv` — 62 transactions, food delivery addiction
- `scenario-02-freelancer-irregular.csv` — irregular income, 11 subscriptions
- `scenario-03-office-worker-saver.csv` — stable income, saving habit
- `scenario-04-subscription-heavy.csv` — 19 subscriptions (!)
- `scenario-05-sberbank-format.csv` — Sberbank CSV format test

## Development Insights
Index: [myinsights/1nsights.md](myinsights/1nsights.md) — check here FIRST before debugging.
On error → grep the error string in the index → read only the matched detail file.
Capture new findings: `/myinsights [title]`
