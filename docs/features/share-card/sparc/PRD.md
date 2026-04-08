# PRD: Share Card Generation

**Feature ID:** share-card | **Status:** COMPLETED | **Date:** 2026-04-08

## Problem
Users want to share their AI roast on social media, driving organic growth. Financial data must never be exposed.

## Solution
Generate privacy-safe share card images: roast text visible, amounts blurred/replaced with emoji bars, cleo-rf branding, referral link for tracking.

## Functional Requirements
| # | Requirement | Priority |
|---|-----------|:--------:|
| 1 | Generate share card image from analysis | P0 |
| 2 | Roast text visible, amounts blurred | P0 |
| 3 | Referral link with unique user code | P0 |
| 4 | Share to VK, Telegram, copy link | P0 |
| 5 | Card generation < 3 seconds | P1 |

## Non-Functional Requirements
- Privacy: actual RUB amounts never appear in card image
- Referral codes: UUID-based, non-guessable
- Image format: PNG, optimized for social media sharing

## Success Metrics
| Metric | Target |
|--------|--------|
| Share rate | > 15% of users with roasts |
| Referral conversion | > 5% click-through |
| K-factor | > 0.3 |

## Dependencies
- roast-mode (roast text must exist)
- user-auth (referral code from user profile)
