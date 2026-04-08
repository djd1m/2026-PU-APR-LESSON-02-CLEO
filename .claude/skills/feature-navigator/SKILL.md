---
name: feature-navigator
description: >
  Navigate project features and suggest next steps. Use when the user
  asks "what's next", "what should I work on", "show roadmap", starts a new task,
  or when a feature is completed. Also trigger on "roadmap", "backlog",
  "sprint", "feature status".
---

# Feature Navigator

Read `.claude/feature-roadmap.json` for current feature status, then present:

## Step 1: Gather Context

1. Read `.claude/feature-roadmap.json`
2. Run `git log --oneline -10` for recent progress
3. Scan for TODO/FIXME in source code

## Step 2: Present Current State

```
Feature Roadmap: cleo-rf
Sprint: [Sprint Name] — [N/M] complete ([X]%)

In Progress:
  [Feature Name] — [description]

Next Up:
  [Feature Name] — [description]

Blocked:
  [Feature Name] — waiting on: [dependency]
```

## Step 3: Suggest Top 3 Actions

1. **[Feature/Task]** — Brief description. Files: `path/to/files`
2. **[Bug/TODO]** — From code scan. Location: `file:line`
3. **[Follow-up]** — Based on recent progress

## Step 4: Ask

```
Which one shall we tackle? (1/2/3 or describe your own)
```

## Updating Roadmap

When a feature is completed:
1. Update status to `"done"` in `.claude/feature-roadmap.json`
2. Check `depends_on` → unblock dependent features → update to `"next"`
3. Inform user

## Priority Rules

- `in_progress` → suggest continuing (highest priority)
- `next` → suggest starting (second priority)
- `planned` → only if no `next` items remain
- `blocked` → show but don't suggest
- Respect `depends_on` — never suggest blocked features
