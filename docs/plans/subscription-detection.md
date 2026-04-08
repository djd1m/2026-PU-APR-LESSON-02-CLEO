# Plan: subscription-detection

**Date:** 2026-04-08
**Complexity:** Simple (1 file, score -3) → /plan
**Status:** COMPLETED

## Goal
Detect recurring subscription payments from transaction history. Flag "parasites" (subscriptions not used in 30+ days). Calculate total monthly/annual subscription cost.

## Tasks
- [x] Normalize merchant descriptions (lowercase, trim, remove IDs) — `apps/api/src/services/subscription-detector.ts`
- [x] Implement fuzzy grouping with Levenshtein distance (threshold 0.8) — `apps/api/src/services/subscription-detector.ts`
- [x] Detect monthly patterns (intervals 25-35 days between charges) — `apps/api/src/services/subscription-detector.ts`
- [x] Detect annual patterns (intervals 350-380 days) — `apps/api/src/services/subscription-detector.ts`
- [x] Filter variable-amount charges (variance >20% = not subscription) — `apps/api/src/services/subscription-detector.ts`
- [x] Flag parasites (last charge >30 days ago) — `apps/api/src/services/subscription-detector.ts`
- [x] Calculate total monthly subscription cost — `apps/api/src/services/subscription-detector.ts`

## Files Modified
- `apps/api/src/services/subscription-detector.ts` — complete implementation

## Test Strategy
- Tested with scenario-04-subscription-heavy.csv (19 subscriptions expected)
- Verified via integration in analysis pipeline (jobs.ts)
- Levenshtein fuzzy matching handles variant merchant names
