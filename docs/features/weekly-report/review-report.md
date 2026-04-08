# Code Review Report: Weekly Spending Report

**Reviewed:** 2026-04-08
**Reviewer:** code-reviewer agent
**Files:** `apps/api/src/services/weekly-report.ts`, `apps/api/src/queue/weekly-report-job.ts`, `apps/api/src/routes/settings.ts`
**Result:** APPROVE

## Review Scope

Review of the weekly report feature covering report generation logic, BullMQ job setup, settings endpoint, error handling, and consistency with existing codebase patterns.

## File: `apps/api/src/services/weekly-report.ts`

### Report Generation Logic

| Aspect | Rating | Notes |
|--------|--------|-------|
| Transaction aggregation | GOOD | Uses date range filtering with proper 7-day window |
| Category breakdown | GOOD | Reuses established category aggregation pattern from jobs.ts |
| Week-over-week comparison | GOOD | Handles zero-division case for new users |
| Mini-roast integration | GOOD | Reuses OpenAI client pattern, enforces 150-char cap |
| Type safety | GOOD | Exported WeeklyReport interface with all required fields |

**Positive findings:**
- Clean separation between data aggregation, AI generation, and formatting
- `formatReportText` handles both Free and Pro tiers with conditional sections
- Null return for empty weeks prevents unnecessary AI calls and notifications
- Russian text formatting uses `toLocaleString('ru-RU')` consistently

## File: `apps/api/src/queue/weekly-report-job.ts`

### Job Configuration

| Aspect | Rating | Notes |
|--------|--------|-------|
| Cron schedule | GOOD | `0 7 * * 1` correctly maps Monday 07:00 UTC to 10:00 MSK |
| Error isolation | GOOD | Per-user try/catch with continue pattern |
| Opt-out filtering | GOOD | Filters at query level, not in application code |
| Notification dispatch | ACCEPTABLE | Console.log placeholder is clearly marked as MVP |

**Positive findings:**
- Job registration follows existing BullMQ pattern from `index.ts`
- User processing loop logs errors with userId for debugging
- Clean async/await flow without callback nesting

## File: `apps/api/src/routes/settings.ts`

### Settings Endpoint

| Aspect | Rating | Notes |
|--------|--------|-------|
| Auth middleware | GOOD | Consistent with other routes (authMiddleware) |
| Input validation | GOOD | Zod schema validates both fields with proper types |
| Default handling | GOOD | Returns sensible defaults when no settings record exists |
| Upsert pattern | GOOD | Handles both create and update in single operation |

**Positive findings:**
- Follows existing route patterns (Router, zod validation, AppError)
- GET endpoint returns defaults even if user has never touched settings
- PATCH accepts partial updates (either field independently)

## Concerns

| # | Severity | Finding | Suggestion |
|---|----------|---------|------------|
| 1 | MINOR | No idempotency guard on weekly job | Add check for already-sent report this week |
| 2 | MINOR | Settings table not yet in DB schema | Will need migration before deployment |
| 3 | INFO | Console.log notification is MVP-only | Track email integration as follow-up ticket |
| 4 | INFO | No metrics for report generation timing | Add histogram metric for batch monitoring |

## Summary

The implementation follows established codebase patterns consistently. Service layer is cleanly separated from job orchestration and route handling. Error isolation ensures robustness in batch processing. The MVP notification placeholder is clearly documented.

Minor suggestions around idempotency and metrics are improvements for production hardening, not blockers.

**Result: APPROVE**
