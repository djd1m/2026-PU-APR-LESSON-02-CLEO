# Git Workflow Rules

## Commit Format
```
type(scope): description

Types: feat, fix, docs, chore, refactor, test, style
Scope: feature name, package name, or component
```

## Branch Strategy
- `main` — production-ready code
- Feature branches: `feature/<name>` (optional for /feature lifecycle)

## Commit Frequency
- Commit after each logical unit of work
- Never accumulate large uncommitted changes
- Push after each completed phase in /feature lifecycle

## Automated Commits (hooks)
- myinsights/ changes → auto-committed on session end
- feature-roadmap.json changes → auto-committed on session end
- docs/plans/ changes → auto-committed on session end
