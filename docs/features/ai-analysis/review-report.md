# Code Review Report: AI Spending Analysis

**Feature:** ai-analysis
**Reviewed:** 2026-04-08
**Reviewer:** code-reviewer agent
**Files Reviewed:**
- `apps/api/src/services/categorizer.ts`
- `apps/api/src/queue/jobs.ts`

## Review Summary

| Area | Rating | Notes |
|------|--------|-------|
| Batch Processing | GOOD | Correctly splits into chunks of 50, iterates sequentially |
| Error Handling | GOOD | Timeout retry implemented, fallback to raw_category works |
| Fallback Logic | GOOD | Graceful degradation, no silent failures |
| Prompt Quality | ADEQUATE | Functional but could benefit from few-shot examples |
| Type Safety | GOOD | Proper TypeScript interfaces, no `any` leaks in public API |
| Testability | ADEQUATE | Pure functions are testable, but API calls need better DI |

**Overall: APPROVE with minor suggestions**

## Detailed Findings

### 1. Batch Processing (categorizer.ts:24-58)

The `categorizeTransactions` function correctly batches transactions using a
chunking utility. Each batch is processed sequentially to respect API rate limits.

**Positive:** Batch size is a named constant (`BATCH_SIZE = 50`), easy to tune.

**Suggestion:** Consider adding a configurable concurrency parameter for parallel
batch processing when rate limits allow. Current sequential approach is safe but
slow for large datasets (500+ transactions = 10+ sequential API calls).

### 2. Error Handling (categorizer.ts:60-89)

Timeout handling follows the spec: one retry, then fallback. The retry uses the
same timeout value, which is correct per AC-4.

**Positive:** Each error path logs the batch index and error type, making debugging
straightforward.

**Minor Issue:** The catch block catches `Error` broadly. Consider distinguishing
between `TimeoutError` and `ParseError` explicitly to avoid retrying on parse
failures (which will fail again with the same response).

```typescript
// Current (line 62):
catch (error) {
  // retries on ANY error, including parse errors

// Suggested:
catch (error) {
  if (error instanceof TimeoutError) {
    // retry
  } else {
    // fallback immediately
  }
}
```

### 3. Fallback Logic (categorizer.ts:91-105)

When AI fails, the code correctly falls back to `transaction.raw_category` from
the CSV parser, defaulting to "Other" if that field is also empty.

**Positive:** The `confidence` field is set to `"fallback"` so downstream consumers
know which transactions were AI-categorized vs. fallback. This is used in the
response to populate `fallbackCount`.

### 4. Prompt Quality (categorizer.ts:12-22)

The system prompt instructs the model in Russian and provides the category list.
Response format is specified as JSON.

**Suggestion:** Add 2-3 few-shot examples to improve accuracy on ambiguous merchants:
```
"Пятёрочка" -> "Groceries"
"Яндекс.Такси" -> "Taxi"
"OZON.ru" -> "Electronics"  // could also be Groceries — examples help
```

Few-shot examples typically improve categorization accuracy by 5-10% on edge cases.

### 5. Job Processor (jobs.ts:15-62)

The `analyzeJob` function orchestrates the pipeline correctly: load transactions,
categorize, build breakdown, generate roast, save results.

**Positive:** Job status updates are granular (processing, categorizing, generating,
completed, failed), enabling accurate progress tracking on the frontend.

**Suggestion:** The roast generation (line 48) uses a separate API call but has no
retry logic. Since the roast is non-critical, this is acceptable, but the timeout
should be documented as intentional (currently 20s with no retry).

### 6. Configuration (categorizer.ts:1-10)

API configuration reads from environment variables: `AI_BASE_URL`, `AI_MODEL_ID`,
`AI_API_KEY`. This matches ADR-004 and allows provider swapping.

**Positive:** The OpenAI client is initialized once at module level, not per-call.

**Minor:** No validation that these env vars are present at startup. Consider adding
a startup check that fails fast if `AI_API_KEY` is missing.

## Recommendations Summary

| # | Type | Description | Priority |
|---|------|-------------|----------|
| 1 | Enhancement | Add concurrency option for parallel batching | Low |
| 2 | Bug prevention | Distinguish TimeoutError from ParseError in catch | Medium |
| 3 | Accuracy | Add few-shot examples to categorization prompt | Medium |
| 4 | Robustness | Validate AI env vars at startup | Low |
| 5 | Documentation | Document intentional no-retry on roast generation | Low |

## Verdict

**APPROVE** -- The implementation correctly follows the specification. Batch processing,
error handling, and fallback logic all match the documented acceptance criteria.
The suggestions above are improvements, not blockers. The code is ready for QA testing
against the labeled transaction dataset to verify the 85% accuracy target.
