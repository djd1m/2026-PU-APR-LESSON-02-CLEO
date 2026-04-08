# ADR-009: Aha Moment Design — Roast + Subscription Detection

**Status:** Accepted
**Date:** 2026-04-08

## Context

The Aha Moment is the first moment a user perceives real value. It must happen within 3 minutes of CSV upload.

## Options Considered

| Option | Time to Aha | Emotional Impact | Shareability |
|--------|:-----------:|:----------------:|:------------:|
| **Roast + subscriptions combo** | < 3 min | HIGH (humor + savings shock) | HIGH |
| Roast only | < 2 min | HIGH | HIGH |
| Subscription tracker only | < 2 min | MEDIUM (practical) | LOW |
| Full budget report | 5+ min | LOW (information overload) | LOW |
| Financial health score | 3-5 min | MEDIUM | MEDIUM |

## Decision

**Dual Aha Moment:**
1. **Primary:** AI Roast of spending habits (emotional hook)
2. **Secondary:** Subscription detection with savings amount (rational hook)

Sequence: CSV upload → 10-15s processing → ROAST screen → scroll down → subscription findings → share CTA

## Consequences

- AI system prompt must generate genuinely funny, culturally relevant Russian humor
- Subscription detection requires pattern matching on recurring payments in CSV
- Share card generator needed (blurred amounts, visible roast text)
- A/B test: roast-first vs subscription-first ordering
