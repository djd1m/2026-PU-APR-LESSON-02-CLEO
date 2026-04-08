# ADR-006: Monetization — Freemium Model (499 RUB/month)

**Status:** Accepted
**Date:** 2026-04-08
**Decision Makers:** Product Owner

## Context

Cleo uses freemium: free basic analysis, $5.99/mo for advanced features. Need to adapt pricing for Russian market.

## Options Considered

| Option | Price | Pros | Cons |
|--------|-------|------|------|
| **Freemium 499 RUB/mo** | Free + 499 RUB/mo | Sweet spot for Gen Z, comparable to streaming | May feel expensive vs free alternatives |
| Freemium 299 RUB/mo | Free + 299 RUB/mo | More accessible | Lower LTV, harder unit economics |
| Freemium 799 RUB/mo | Free + 799 RUB/mo | Better economics | Above subscription fatigue threshold |
| One-time purchase | 1999 RUB | No recurring friction | No predictable revenue |
| Ad-supported free | Free | Maximum adoption | Bad UX for fintech, trust issues |
| Usage-based | Per analysis | Fair pricing | Unpredictable revenue |

## Decision

**Freemium with 499 RUB/month premium tier:**

| Tier | Price | Features |
|------|-------|----------|
| **Free** | 0 RUB | CSV upload, basic spend analysis, top-5 categories, 1 roast/day, basic recommendations |
| **Pro** | 499 RUB/mo (3999 RUB/yr) | Unlimited roasts, subscription tracker, savings goals, advanced AI insights, weekly reports, custom categories, priority support |

## Rationale

- 499 RUB is in the "comfortable" zone for Gen Z subscriptions (37% spend 500-1000 RUB/mo on digital services)
- Annual discount (3999 RUB = 333 RUB/mo) incentivizes retention
- Cleo's success: 1.1M paid at $5.99/mo proves willingness to pay for "personality-driven" PFM
- Free tier must deliver enough value for viral growth (roast screenshots)

## Consequences

- Free tier is the growth engine — must not feel crippled
- Conversion target: 5-10% free-to-paid (Cleo achieves ~12%)
- Need compelling paywall moment (after user sees first savings opportunity)
- Russian payment processors: YooMoney, CloudPayments, or Stripe (if available)
