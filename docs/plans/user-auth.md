# Plan: user-auth

**Date:** 2026-04-08
**Complexity:** Simple (3 files, score -2) → /plan
**Status:** COMPLETED

## Goal
Email + password authentication with JWT tokens. Telegram auth support. Rate limiting on auth endpoints.

## Tasks
- [x] Implement POST /api/auth/register with Zod validation (email, password, name, age) — `apps/api/src/routes/auth.ts`
- [x] Implement bcrypt password hashing (cost factor 12) — `apps/api/src/routes/auth.ts`
- [x] Implement POST /api/auth/login with hash comparison — `apps/api/src/routes/auth.ts`
- [x] Generate JWT with payload {userId, plan}, 7-day expiry — `apps/api/src/routes/auth.ts`
- [x] Generate unique referral code on registration — `apps/api/src/routes/auth.ts`
- [x] Create auth middleware for JWT verification — `apps/api/src/middleware/auth.ts`
- [x] Create rate limiter middleware (Map-based, configurable) — `apps/api/src/middleware/rate-limit.ts`
- [x] Create login page with email/password form — `apps/web/app/(auth)/login/page.tsx`
- [x] Create register page with name/age/email/password — `apps/web/app/(auth)/register/page.tsx`
- [x] Store JWT in localStorage, redirect on success — `apps/web/lib/api.ts`

## Files Modified
- `apps/api/src/routes/auth.ts` — register + login endpoints
- `apps/api/src/middleware/auth.ts` — JWT verification middleware
- `apps/api/src/middleware/rate-limit.ts` — rate limiter
- `apps/web/app/(auth)/login/page.tsx` — login UI
- `apps/web/app/(auth)/register/page.tsx` — register UI
- `apps/web/lib/api.ts` — API client with JWT handling
- `packages/db/src/schema/users.ts` — user schema with passwordHash

## Test Strategy
- Auth endpoints validated via Zod schemas
- JWT verification tested through protected routes
- bcrypt cost factor 12 ensures secure hashing
- Rate limiting prevents brute force (configurable per-route)
