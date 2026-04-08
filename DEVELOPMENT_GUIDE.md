# Development Guide: cleo-rf

## Quick Start

```bash
# 1. Clone and setup
git clone <repo-url>
cd cleo-rf

# 2. Bootstrap project (reads docs, generates code, starts Docker)
/start

# 3. Or build entire MVP autonomously
/run mvp
```

## Development Workflow

### Single Feature
```bash
/next                    # See what's next
/go <feature-name>       # Auto-selects pipeline, implements, commits, pushes
```

### Full MVP Build
```bash
/run                     # Bootstrap → implement MVP features → tag v0.1.0-mvp
/run mvp                 # Same as above
```

### Complete Project Build
```bash
/run all                 # Bootstrap → implement ALL features → tag v1.0.0
```

### Feature Lifecycle (manual)
```bash
/feature <name>          # Full 4-phase: PLAN → VALIDATE → IMPLEMENT → REVIEW
/plan <task>             # Lightweight plan for simple tasks (<=3 files)
```

### Knowledge Management
```bash
/myinsights <title>      # Capture an insight after resolving a tricky issue
/myinsights list         # Browse all insights
/harvest quick           # Extract reusable knowledge
```

### Documentation
```bash
/docs                    # Generate docs in README/rus/ and README/eng/
/docs rus                # Russian only
/docs update             # Update existing docs
```

### Deployment
```bash
/deploy staging          # Deploy to local Docker
/deploy production       # Deploy to VPS (requires confirmation)
```

## Command Hierarchy

```
/run mvp|all
  └── /start (bootstrap — if not done)
  └── LOOP:
      ├── /next (find next feature from roadmap)
      └── /go <feature> (analyze complexity → select pipeline)
          ├── /plan (simple tasks, complexity score <= -2)
          └── /feature (standard/complex features, score > -2)
              ├── Phase 1: PLAN (sparc-prd-mini → SPARC docs)
              ├── Phase 2: VALIDATE (requirements-validator, score >= 70)
              ├── Phase 3: IMPLEMENT (parallel agents from docs)
              └── Phase 4: REVIEW (brutal-honesty-review)
```

## Environment Variables

```bash
# AI Configuration (required)
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-...
AI_MODEL_ID=gpt-4o-mini

# Database (required)
DB_PASSWORD=your-secure-password

# Auth (required)
JWT_SECRET=your-jwt-secret

# Optional
TELEGRAM_BOT_TOKEN=...
```

## Project Structure

```
cleo-rf/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Express API + BullMQ worker
├── packages/
│   ├── shared/           # Types, constants, utils
│   └── db/               # Drizzle schema, migrations
├── docs/                 # SPARC documentation (22 files)
├── test-data/            # 5 CSV test scenarios
├── .claude/              # Claude Code toolkit
│   ├── commands/         # /start, /feature, /plan, /next, /go, /run, /docs, /deploy, /myinsights
│   ├── agents/           # planner, code-reviewer, architect
│   ├── rules/            # git-workflow, feature-lifecycle, security, coding-style, insights-capture
│   ├── skills/           # feature-navigator + 8 shared skills
│   ├── hooks/            # feature-context.py (SessionStart)
│   ├── feature-roadmap.json  # Feature status tracking
│   └── settings.json     # Hooks (auto-commit insights, roadmap, plans)
├── myinsights/           # Living knowledge base
├── docker-compose.yml
├── CLAUDE.md             # Project context for Claude Code
└── DEVELOPMENT_GUIDE.md  # This file
```

## Git Conventions

- **Commits:** `type(scope): description` (feat, fix, docs, chore, refactor, test)
- **Auto-commits:** myinsights/, feature-roadmap.json, docs/plans/ committed on session end
- **Push:** After each phase in /feature lifecycle

## Testing

```bash
npx turbo test           # Run all tests
npx turbo test --filter=api   # API tests only
```

Test CSV files in `test-data/` cover: student impulse spending, freelancer irregular income, office worker savings, subscription overload, and Sberbank format parsing.
