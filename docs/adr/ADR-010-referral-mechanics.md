# ADR-010: Referral Mechanics — Roast Share Cards

**Status:** Accepted
**Date:** 2026-04-08

## Context

Cleo's viral growth is driven by users sharing roast screenshots. We need a structured referral system for cleo-rf.

## Options Considered

| Option | Virality | Dev Cost | Privacy Risk |
|--------|:--------:|:--------:|:------------:|
| **Share card with blurred data** | HIGH | LOW | LOW |
| Full screenshot sharing | HIGH | ZERO | HIGH (exposes data) |
| Referral code only | LOW | LOW | ZERO |
| "Invite friends" modal | LOW | LOW | ZERO |
| Social leaderboard | MEDIUM | HIGH | MEDIUM |

## Decision

**Roast share card generator:**
- Generates image card with: roast text (visible) + amounts (blurred/replaced with emojis) + cleo-rf branding + referral link
- Platforms: VK Clips, TikTok, Telegram, Instagram Stories
- Incentive: referred friend gets Pro for 7 days, referrer gets 1 extra week of Pro

## Implementation

```
Share Card Layout:
┌─────────────────────────┐
│  cleo-rf                │
│  ────────────────────── │
│  "47K на еду за месяц?  │
│   Ты ресторанный критик │
│   или просто ленивый?"  │
│  ────────────────────── │
│  🍕 Еда: ██████ руб    │
│  🏠 Жильё: █████ руб   │
│  🎮 Развлечения: ████   │
│  ────────────────────── │
│  Узнай что AI скажет    │
│  о ТВОИХ тратах →       │
│  cleorf.app/r/XXXX      │
└─────────────────────────┘
```

## Consequences

- Need image generation service (canvas API or server-side rendering)
- Referral tracking via unique codes
- Privacy: never expose actual amounts in share cards
- A/B test: emoji blur vs number blur vs category-only
