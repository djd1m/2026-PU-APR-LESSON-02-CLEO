# Plan: csv-upload

**Date:** 2026-04-08
**Complexity:** Simple (3 files, score -2) → /plan
**Status:** COMPLETED

## Goal
Multi-format CSV parser that auto-detects encoding (UTF-8/Win-1251), delimiter (;/,/\t), and bank format (Tinkoff, Sberbank, Alfa, generic) from uploaded bank transaction files.

## Tasks
- [x] Implement encoding auto-detection (UTF-8 → Win-1251 fallback) — `apps/api/src/services/csv-parser.ts`
- [x] Implement delimiter auto-detection (count occurrences in first 5 lines) — `apps/api/src/services/csv-parser.ts`
- [x] Implement bank format detection via header pattern matching — `apps/api/src/services/csv-parser.ts`
- [x] Implement CSV line splitting with quoted field support — `apps/api/src/services/csv-parser.ts`
- [x] Implement date parsing (DD.MM.YYYY, YYYY-MM-DD, DD/MM/YYYY) — `packages/shared/src/utils/date.ts`
- [x] Implement amount parsing (comma decimal separator) — `packages/shared/src/utils/money.ts`
- [x] Define bank format configs (Tinkoff, Sberbank, Alfa) — `packages/shared/src/constants/bank-formats.ts`
- [x] Create upload route with multer (10MB max, CSV only) — `apps/api/src/routes/upload.ts`
- [x] Create upload page with drag-and-drop — `apps/web/app/upload/page.tsx`
- [x] Write tests for all 5 test CSV scenarios — `apps/api/src/__tests__/csv-parser.test.ts`

## Files Modified
- `apps/api/src/services/csv-parser.ts` — core parser (297 lines)
- `apps/api/src/routes/upload.ts` — upload endpoint
- `apps/web/app/upload/page.tsx` — upload UI
- `apps/web/components/upload/csv-dropzone.tsx` — dropzone component
- `packages/shared/src/constants/bank-formats.ts` — format configs
- `packages/shared/src/utils/date.ts` — date parsing
- `packages/shared/src/utils/money.ts` — amount parsing

## Test Strategy
- 17 unit tests covering: format detection (Tinkoff, Sberbank), all 5 CSV scenarios, encoding (UTF-8, Win-1251), amounts (negative, positive, comma decimal), dates (DD.MM.YYYY, YYYY-MM-DD), delimiters (semicolon, comma, tab), raw category extraction
- **Result:** 17/17 passed
