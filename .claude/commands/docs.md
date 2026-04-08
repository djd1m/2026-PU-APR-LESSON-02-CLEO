---
description: Generate or update project documentation in Russian and English.
  Creates a comprehensive set of markdown files covering deployment, usage,
  architecture, and user flows.
  $ARGUMENTS: optional flags — "rus" (Russian only), "eng" (English only), "update" (refresh existing)
---

# /docs $ARGUMENTS

## Purpose

Generate professional, bilingual project documentation from source code,
existing docs, and development insights. Output: `README/rus/` and `README/eng/`.

## Step 1: Gather Context

Read all available sources:

### Primary sources:
- `docs/PRD.md` — product requirements, features
- `docs/Architecture.md` — system architecture, tech stack
- `docs/Specification.md` — API, data model, user stories
- `docs/Completion.md` — deployment, environment setup
- `CLAUDE.md` — project overview, commands, agents
- `DEVELOPMENT_GUIDE.md` — development workflow
- `docker-compose.yml` — infrastructure services
- `.env.example` — environment variables

### Secondary sources:
- `myinsights/1nsights.md` — development insights index
- `.claude/feature-roadmap.json` — feature list and statuses

### Tertiary sources:
- Source code structure
- `package.json` — dependencies, scripts

## Step 2: Determine Scope

```
IF $ARGUMENTS contains "rus":  languages = ["rus"]
ELIF $ARGUMENTS contains "eng": languages = ["eng"]
ELSE: languages = ["rus", "eng"]

IF $ARGUMENTS contains "update": mode = "update"
ELSE: mode = "create"
```

## Step 3: Generate Documentation Set

For EACH language, generate 7 files in `README/<lang>/`:

1. **deployment.md** — Quick start, Docker deployment, production setup, updates
2. **admin-guide.md** — User management, config, monitoring, backups, troubleshooting
3. **user-guide.md** — Registration, features walkthrough, FAQ
4. **infrastructure.md** — Hardware requirements, network, dependencies
5. **architecture.md** — System diagram, tech stack, data model, security, scaling
6. **ui-guide.md** — Screen structure, key screens, controls
7. **user-flows.md** — User & admin flow diagrams (Mermaid)

## Step 4: Generate Output

```bash
mkdir -p README/rus README/eng
```

Generate `README/index.md` — table of contents linking both languages.

## Step 5: Commit and Report

```bash
git add README/
git commit -m "docs: generate project documentation (RU/EN)"
git push origin HEAD
```

## Update Mode

When `$ARGUMENTS` contains "update":
1. Read existing files in `README/`
2. Compare with current project state
3. Update only changed sections
4. Preserve manual additions
