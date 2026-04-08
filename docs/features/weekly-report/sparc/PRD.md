# PRD: Weekly Spending Report (Feature RF-006)

## Overview

Weekly Spending Report delivers a recurring spending summary with a mini-roast to users every Monday at 10:00 MSK. The report includes total weekly spending, top-3 expense categories, subscription alerts (Pro only), a comparison to the previous week, and a short AI-generated humorous commentary (50-150 characters).

## Problem Statement

Users upload bank statements and get one-time analysis, but lack ongoing engagement. Without regular touchpoints, users forget about the app between uploads. A weekly nudge with personality keeps Cleo RF top-of-mind and drives repeat usage.

## Target Audience

- Active users who have uploaded at least one bank statement
- Users who want to track spending trends without manual effort
- Pro users seeking detailed category breakdowns and subscription monitoring

## Feature Requirements

### Report Contents

| Component | Free Tier | Pro Tier |
|-----------|-----------|----------|
| Weekly total spent | Yes | Yes |
| Top-3 categories | Yes | Yes |
| Mini-roast (50-150 chars) | Yes | Yes |
| Week-over-week comparison | Yes | Yes |
| Full category breakdown | No | Yes |
| Subscription alerts | No | Yes |

### Delivery

- **Schedule:** Every Monday at 10:00 MSK
- **Channel (MVP):** Console log (email integration placeholder)
- **Channel (Future):** Email, push notification, Telegram bot
- **Opt-out:** Users can disable weekly reports in settings

### Mini-Roast Parameters

- **Length:** 50-150 characters (shorter than full roast)
- **Style:** Always `roast` (sarcastic) for weekly summaries
- **Language:** Russian, Gen Z friendly

## Success Metrics

| Metric | Target |
|--------|--------|
| Weekly report open rate | >40% |
| Pro conversion from report CTA | >2% |
| Opt-out rate | <15% |
| Report generation success rate | >99% |

## Dependencies

- AI Analysis feature (RF-002) — transaction categorization data
- BullMQ — repeatable job scheduling
- User settings table — opt-out preference storage

## Out of Scope

- Real email/push delivery (MVP uses console.log placeholder)
- Custom report schedule (always Monday 10:00 MSK)
- Report history/archive viewing in UI
