# Code Review Report: Pro Subscription

## Date: 2026-04-08
## Reviewer: AI Code Reviewer
## Feature: pro-subscription
## Verdict: APPROVE

---

## Files Reviewed

| File                                        | Lines | Status   |
|---------------------------------------------|-------|----------|
| `apps/api/src/routes/subscription.ts`       | ~80   | APPROVED |
| `apps/api/src/services/payment.ts`          | ~60   | APPROVED |
| `apps/api/src/middleware/check-pro.ts`       | ~40   | APPROVED |

---

## Route: subscription.ts

### Strengths
- All 4 endpoints follow existing project conventions (Router, zod validation, AppError)
- Webhook endpoint correctly skips auth middleware (providers call it server-to-server)
- Checkout endpoint uses auth middleware to identify the user
- Consistent JSON response shape matching the project's `{ data: ... }` / `{ error: ... }` pattern

### Observations
- Webhook signature verification happens before any database access -- correct order
- Idempotency check prevents double-activation on duplicate webhook delivery
- Cancel endpoint does not immediately revoke Pro -- matches spec (keeps until period end)
- Status endpoint exposes gracePeriodEndsAt for frontend use

### Suggestions (non-blocking)
- Consider adding request logging middleware specific to payment routes for audit trail
- Webhook raw body parsing should be configured at the Express level (`express.raw`)

---

## Service: payment.ts

### Strengths
- Clean abstraction: `createPaymentSession` and `verifyWebhookSignature` are provider-agnostic
- Mock implementation is clearly marked and sufficient for MVP testing
- `verifyWebhookSignature` uses `crypto.timingSafeEqual` to prevent timing attacks
- Session IDs use `crypto.randomUUID()` for uniqueness

### Observations
- Mock provider returns a local redirect URL -- works for development flow
- Real provider swap is isolated to this single file -- good separation of concerns

### Suggestions (non-blocking)
- Add JSDoc comments documenting the expected interface for real provider integration
- Consider a provider factory pattern when adding CloudPayments/SBP support

---

## Middleware: check-pro.ts

### Strengths
- Grace period logic is correct: `proExpiresAt + 3 days > now` grants access
- Auto-downgrades expired users in the database on access (lazy evaluation)
- Attaches `isPro` boolean to the request object for downstream handlers
- Does not block requests -- free users pass through, handlers decide what to restrict

### Observations
- Lazy downgrade means the user record is updated on first access after grace period
- This avoids needing a cron job for expiry processing in MVP

### Suggestions (non-blocking)
- Add a scheduled job post-MVP to batch-downgrade expired users (avoid lazy write on read path)
- Consider caching Pro status in JWT to reduce DB lookups per request

---

## Security Checklist

| Check                                  | Result |
|----------------------------------------|--------|
| Auth middleware on protected routes     | PASS   |
| No auth on webhook (server-to-server)  | PASS   |
| Webhook signature verified first       | PASS   |
| Timing-safe signature comparison       | PASS   |
| No raw payment data logged             | PASS   |
| Environment variable for webhook secret| PASS   |
| Input validation via zod               | PASS   |

---

## Summary

The implementation is clean, follows project conventions, and correctly handles the
subscription lifecycle (checkout, webhook, cancel, status). Security is solid with
HMAC verification and timing-safe comparison. The mock payment provider is appropriate
for MVP and isolated for easy replacement.

**Verdict: APPROVE** -- ready for merge after integration testing.
