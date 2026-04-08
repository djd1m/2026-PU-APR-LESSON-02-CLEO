# Plan: hype-mode

**Date:** 2026-04-08
**Complexity:** Simple (3 files, score -2) → /plan
**Status:** COMPLETED

## Goal
Positive encouragement mode as alternative to roast. When user selects "hype" style, AI generates supportive, motivating commentary about spending habits instead of sarcastic critique.

## Tasks
- [x] Add hype system prompt to prompts/roast.ts (already has placeholder)
- [x] Update roast route to accept style parameter and switch prompts
- [x] Add hype mode toggle UI in analysis page
- [x] Add hype-style chat bubble variant (green accent instead of rose)

## Files to Modify
- `apps/api/src/prompts/roast.ts` — verify/enhance hype system prompt
- `apps/api/src/routes/roast.ts` — verify style parameter handling
- `apps/web/app/analysis/[id]/page.tsx` — add style toggle button
- `apps/web/components/chat/roast-message.tsx` — verify hype style variant

## Test Strategy
- Verify hype prompt generates positive Russian text
- Verify style toggle switches between roast/hype in UI
- Verify rate limiting applies equally to both styles
