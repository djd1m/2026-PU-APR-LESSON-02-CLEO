# ADR-008: CJM Variant Selection — "Roast First" (A) + Savings Elements (B)

**Status:** Accepted
**Date:** 2026-04-08
**Decision Makers:** Product Owner + AI Architect

## Context

Three CJM variants were developed for cleo-rf based on M2 customer segment analysis:
- A: "Roast First" — humor-driven, viral-first approach
- B: "Savings Hunter" — utility-driven, subscription tracking focus
- C: "Social Finance" — peer comparison, social accountability

## Decision

**Variant A "Roast First"** as primary CJM, with subscription tracker from Variant B as secondary Aha Moment.

## Scoring Matrix

| Criterion | Weight | A | B | C |
|-----------|:------:|:-:|:-:|:-:|
| Viral potential | 25% | 5 | 2 | 4 |
| Time to Aha | 20% | 5 | 5 | 3 |
| Retention D30 | 20% | 4 | 3 | 5 |
| Conversion | 15% | 4 | 5 | 3 |
| Dev complexity | 10% | 5 | 4 | 2 |
| Cultural fit RU | 10% | 5 | 4 | 3 |
| **Weighted Score** | | **4.35** | **3.75** | **3.55** |

## Rationale

1. **Cleo's proven model:** $280M ARR driven by personality/humor — validated at scale
2. **Viral acquisition:** Roast screenshots drive organic growth (K-factor potential > 0.3)
3. **Cultural resonance:** Russian internet culture (memes, self-deprecation) aligns perfectly
4. **Lowest complexity:** Chat UI + AI = fastest path to MVP
5. **Subscription tracker from B:** Adds functional value (Aha Moment #2) without B's lower virality

## What We Take from Each Variant

| From | Feature | Why |
|------|---------|-----|
| A | Roast Mode as entry hook | Viral + emotional engagement |
| A | Share card generation | Organic growth engine |
| B | Subscription tracker | Instant tangible value |
| B | Savings amount as paywall trigger | Higher conversion |
| C (v2) | Financial Health Score | Long-term retention |
| C (v2) | Peer comparison | Social motivation |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Roast novelty wears off | Content refresh: seasonal roasts, trending references, personality modes |
| Cultural translation fails | Test roast scripts with RU focus group before launch |
| Low CSV re-upload rate | Weekly push + gamified streak ("7 дней подряд на бюджете") |

## Consequences

- MVP scope: Chat UI + CSV parser + AI roast engine + subscription detector + share cards
- Growth strategy: VK Clips/TikTok content → organic → paid amplification
- Paywall: After 3rd roast + showing total savings opportunity
