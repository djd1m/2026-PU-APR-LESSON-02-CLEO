# [INS-001] /run mvp skipped /go pipeline — features marked done without per-feature docs

**Date:** 2026-04-08
**Status:** Active
**Severity:** Critical
**Tags:** `pipeline`, `feature-lifecycle`, `run`, `go`, `documentation`
**Hits:** 1

## Error Signatures
```
feature marked done without /go
no per-feature docs
docs/features/ empty
docs/plans/ empty
```

## Symptoms
After `/run mvp` completed, all 8 MVP features were marked as `done` in `feature-roadmap.json`, but:
- `docs/features/` was empty (0 files)
- `docs/plans/` was empty (0 files)
- No per-feature SPARC documentation was generated
- No validation reports existed
- No review reports existed

This violated the rule in `feature-lifecycle.md`: "ALL features get SPARC documentation, no exceptions."

## Diagnostic Steps
1. Checked `docs/features/` — empty
2. Checked `docs/plans/` — empty
3. Read `feature-lifecycle.md` — confirmed requirement for per-feature docs
4. Read `/feature` command template — confirmed 4-phase lifecycle with doc generation
5. Read `/go` command — confirmed complexity scoring + routing to `/plan` or `/feature`
6. Traced `/run` execution — found it treated `/start` scaffold as complete implementation

## Root Cause
The `/run` command detected that code files already existed (created by `/start` scaffold) and treated this as "feature implemented". It skipped the `/next → /go → /plan|/feature` pipeline entirely, going straight to marking features as `done`.

The `/start` command generates scaffold code for ALL features at once, but this is NOT the same as implementing features through the `/go` pipeline. The `/go` pipeline produces:
- Per-feature SPARC docs (via `/feature`) or plan files (via `/plan`)
- Validation reports (score >= 70)
- Review reports (brutal-honesty-review)

## Solution
1. **Fixed `/run` command** — added blocking rules:
   - "NEVER mark a feature as done without running /go (even if code exists from /start scaffold)"
   - "CRITICAL: /go MUST produce per-feature docs — no exceptions"
   - "MUST push git after EACH feature is done"

2. **Generated missing docs retroactively:**
   - 4 plan files for simple features (csv-upload, user-auth, subscription-detection, spending-dashboard)
   - 20 SPARC files for 4 complex features (ai-analysis, roast-mode, share-card, savings-recommendations)

3. **For future features** — `/run` now enforces full `/next → /go → /plan|/feature` cycle even when scaffold code exists

## Prevention
- The `/run` command now has explicit blocking rules against skipping `/go`
- Rule added to `feature-lifecycle.md`: ALL features get docs, no exceptions
- When `/start` creates scaffold code, `/run` must still run `/go` which will:
  - Score complexity
  - Route to `/plan` (simple) or `/feature` (complex)
  - Generate per-feature documentation
  - Validate requirements
  - Review implementation
  - Only THEN mark as `done`

## Related
- `.claude/commands/run.md` — updated with blocking rules
- `.claude/commands/go.md` — complexity scoring + pipeline selection
- `.claude/commands/feature.md` — 4-phase lifecycle
- `.claude/rules/feature-lifecycle.md` — documentation requirements
