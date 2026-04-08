# PRD: Savings Recommendations

**Feature ID:** savings-recommendations | **Status:** COMPLETED | **Date:** 2026-04-08

## Problem
Users see spending breakdown but don't know what to do. Generic advice ("spend less") is useless and ignored.

## Solution
AI-generated personalized recommendations referencing user's actual categories and subscriptions, with estimated monthly savings in RUB.

## Functional Requirements
| # | Requirement | Priority |
|---|-----------|:--------:|
| 1 | Generate 3-5 specific recommendations per analysis | P0 |
| 2 | Each references actual category or subscription | P0 |
| 3 | Each includes estimated monthly savings in RUB | P0 |
| 4 | Detect duplicate subscriptions → consolidation tip | P1 |
| 5 | Adjust tone for frugal users (optimize, not cut) | P1 |

## Non-Functional Requirements
- No generic advice (validated by checking category reference)
- Generated within AI analysis pipeline (no extra API call for user)
- Russian language, actionable format

## Success Metrics
| Metric | Target |
|--------|--------|
| View rate | > 60% of analysis viewers |
| Action rate | > 10% act on a recommendation |

## Dependencies
- ai-analysis (categories must exist)
- subscription-detection (subscription data for consolidation tips)
