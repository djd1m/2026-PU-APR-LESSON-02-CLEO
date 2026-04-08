---
description: Lightweight implementation planning for simple tasks (<=3 files).
  Creates a plan file in docs/plans/ and optionally implements immediately.
  $ARGUMENTS: task name or description
---

# /plan $ARGUMENTS

## Purpose

Quick planning for simple tasks that don't need full SPARC lifecycle.
Creates a single plan file, then implements.

## When to Use

- Task touches <=3 files
- Hotfix or minor improvement
- Config change
- Small refactoring
- Implementation < 30 minutes

For larger features, use `/feature` instead.

## Process

### Step 1: Create Plan

Create `docs/plans/<task-name>.md`:

```markdown
# Plan: <task-name>

**Date:** YYYY-MM-DD
**Complexity:** Simple (<=3 files)

## Goal
[What we're trying to achieve]

## Tasks
- [ ] [Task 1 — file: path/to/file.ts]
- [ ] [Task 2 — file: path/to/file.ts]
- [ ] [Task 3 — file: path/to/file.ts]

## Files to Modify
- `path/to/file1.ts` — [what changes]
- `path/to/file2.ts` — [what changes]

## Dependencies
- [None / list dependencies]

## Risks
- [None / list risks]

## Test Strategy
- [How to verify the change works]
```

### Step 2: Implement

1. Follow the plan step by step
2. Commit after each logical change: `fix|feat|refactor(<scope>): <what>`
3. Run relevant tests
4. Mark tasks as done in the plan file

### Step 3: Finalize

1. Update plan file with completion status
2. Push: `git push origin HEAD`
3. If called from `/go`: update feature-roadmap.json
