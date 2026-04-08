# Code Review Report: AI Roast Mode

**Reviewed:** 2026-04-08
**Reviewer:** code-reviewer agent
**Files:** `apps/api/src/routes/roast.ts`, `apps/api/src/prompts/roast.ts`
**Result:** APPROVE

## Review Scope

Review of the roast mode implementation covering prompt engineering quality, rate limiting logic, content guardrails, and Russian language output quality.

## File: `apps/api/src/prompts/roast.ts`

### Prompt Quality

| Aspect | Rating | Notes |
|--------|--------|-------|
| System prompt clarity | GOOD | Clear role definition, explicit constraints, character limits |
| Style differentiation | GOOD | Three distinct personas with non-overlapping tone profiles |
| Russian language quality | GOOD | Natural Gen Z slang, culturally appropriate references |
| Guardrail instructions in prompt | GOOD | Explicit "do not" list embedded in system prompt as defense-in-depth |

**Positive findings:**
- System prompts are well-structured with explicit persona, task, constraints, and output format
- Character limit (100-300) is enforced both in prompt instruction and post-generation validation
- Russian text reads naturally — not machine-translated, uses authentic slang patterns
- Each style has distinct personality markers that prevent tone bleed between modes

**Minor observation:**
- Prompt variants are hardcoded as constants. Consider extracting to a configuration layer to enable A/B testing of prompt variations without code deployment. This would allow product team to iterate on tone independently.

## File: `apps/api/src/routes/roast.ts`

### Rate Limiting Logic

| Aspect | Rating | Notes |
|--------|--------|-------|
| Counter implementation | GOOD | Redis INCR with TTL; atomic operation prevents race conditions |
| Midnight MSK reset | GOOD | Uses `lastRoastDate` comparison, not TTL-based expiry |
| Pro tier bypass | GOOD | Clean conditional; no rate limit for Pro users |
| Error handling | GOOD | Rate limit failure returns structured paywall response |

**Positive findings:**
- Rate limit check happens before LLM call — no wasted API spend on blocked requests
- Counter reset logic correctly handles timezone (MSK) rather than UTC
- Paywall response includes `nextResetAt` timestamp for client-side countdown display

### Guardrail Implementation

| Aspect | Rating | Notes |
|--------|--------|-------|
| Regex pattern coverage | GOOD | Covers offensive terms, slurs, poverty-mocking language |
| Length validation | GOOD | Rejects too-short and too-long responses |
| Fallback mechanism | GOOD | Pre-approved templates ensure user always gets content |
| Logging | GOOD | Failed guardrail checks logged with reason for review |

**Positive findings:**
- Two-layer defense: prompt-level instructions + post-generation regex filter
- Fallback templates are style-matched — user experience remains consistent
- Low-spender detection (< 15000 RUB) gracefully overrides style to `hype`

### Concerns

| # | Severity | Finding | Suggestion |
|---|----------|---------|------------|
| 1 | MINOR | No A/B testing hooks for prompt variants | Add experiment ID to roast records for future analysis |
| 2 | MINOR | Fallback template pool is small (2-3 per style) | Expand to 10+ to avoid repetition for frequent users |
| 3 | INFO | No metrics emission for guardrail trigger rate | Add counter metric for monitoring dashboard |
| 4 | INFO | Cache layer not implemented yet | Consider caching roasts for same-day repeated views |

## Russian Language Quality Check

Reviewed all system prompts and fallback templates for:
- Grammar and spelling: PASS
- Natural tone for target demographic: PASS
- Cultural appropriateness: PASS
- Absence of offensive or discriminatory content: PASS
- Slang currency (not outdated): PASS

## Summary

The implementation is clean, well-structured, and production-ready. Prompt engineering follows best practices with clear persona definitions and explicit guardrails. Rate limiting is correctly implemented with atomic Redis operations and proper timezone handling. The two-layer content safety approach (prompt instructions + post-generation filter) provides adequate protection.

The minor suggestions around A/B testing and fallback pool expansion are improvements for iteration, not blockers.

**Result: APPROVE**
