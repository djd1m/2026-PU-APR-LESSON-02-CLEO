# cleo-rf — Executive Summary

## Overview

cleo-rf is an AI-powered personal finance assistant for Russian Gen Z (18-30). Users upload bank CSV files and receive spending analysis through a personality-driven chatbot with "Roast Mode" — humorous, sharp commentary that turns financial awareness into shareable entertainment. Built as a Russian adaptation of Cleo AI ($280M+ ARR), filling the gap left by departing global PFM apps.

## Problem & Solution

**Problem:** 18M Russian Gen Z users overspend, subscribe to 8+ forgotten services, and ignore boring PFM tools. Existing alternatives (Дзен-мани, CoinKeeper) are utilitarian trackers with <10% engagement.

**Solution:** AI chatbot with personality that roasts spending habits, detects subscription parasites, and generates shareable content — making financial awareness fun and viral.

## Target Users

| Segment | Share | Key Job |
|---------|:-----:|---------|
| Импульсивный студент | 45% | "Where does my money go by the 15th?" |
| Фрилансер | 30% | "How to smooth out irregular income?" |
| Офисный работник | 25% | "Help me save for a goal" |

## Key Features (MVP)

1. **CSV Upload & Smart Parsing** — auto-detect Sberbank/Tinkoff/Alfa formats
2. **AI Spending Analysis** — top categories, trends, anomalies
3. **Roast Mode** — personality-driven humorous spending critique
4. **Subscription Detection** — find and flag forgotten recurring payments
5. **Share Cards** — privacy-safe shareable roast images with referral links
6. **Savings Recommendations** — actionable tips with estimated savings

## Technical Approach

- **Architecture:** Distributed Monolith in Monorepo (3 containers)
- **Stack:** Next.js + Express + BullMQ + PostgreSQL + Redis
- **AI:** OpenAI-compatible API (configurable base_url + model_id)
- **Deploy:** Docker Compose on VPS
- **Differentiator:** Personality as a product, not a feature

## Research Highlights

1. **Market gap confirmed:** No AI-powered PFM in Russia (global players exited)
2. **Cleo proves model:** $280M ARR, 1.1M paying subscribers from personality-first approach
3. **Gen Z ready:** 79% trust financial advice from social media, self-roast is top 2025 trend
4. **Subscription fatigue:** 72% underestimate subscription spending by 40% — instant value
5. **Open Banking coming:** 5 Russian banks in pilot, CSV bridges until 2027+

## Success Metrics

| Metric | M3 | M6 | M12 |
|--------|:--:|:--:|:---:|
| MAU | 200 | 2,000 | 20,000 |
| Paying subscribers | — | 250 | 2,500 |
| MRR (RUB) | — | 125K | 1.25M |
| D7 retention | >30% | >40% | >50% |

## Timeline

| Phase | When | What |
|-------|------|------|
| MVP | Weeks 1-8 | Core features, CSV parsing, Roast Mode |
| Beta | Weeks 9-10 | 50 testers, iterate |
| Launch | Week 10 | Public launch |
| v1.0 | Month 3-4 | Pro subscription, weekly reports |
| v2.0 | Month 6-8 | Open Banking API, Voice Roast |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Humor doesn't translate | Pre-launch testing with RU focus group |
| CSV friction kills retention | Excellent UX + push reminders + gamified streaks |
| Bank launches competitor | Speed + brand personality moat |
| LLM generates offensive content | Content guardrails + report button |

## Immediate Next Steps

1. **Scaffold project** — monorepo setup, Docker Compose, database schema
2. **Build CSV parser** — support top-3 Russian bank formats
3. **Implement Roast engine** — system prompts, guardrails, rate limiting
4. **Create landing page** — value prop, waitlist, viral demo
5. **Recruit 20 beta testers** — Telegram groups, student chats

## Documentation Package

| Document | Description |
|----------|-------------|
| [PRD.md](PRD.md) | Product Requirements |
| [Solution_Strategy.md](Solution_Strategy.md) | Problem Analysis (SCQA, TRIZ, Game Theory) |
| [Specification.md](Specification.md) | User Stories + Acceptance Criteria |
| [Pseudocode.md](Pseudocode.md) | Algorithms, Data Structures, API Contracts |
| [Architecture.md](Architecture.md) | System Design, Tech Stack, DB Schema |
| [Refinement.md](Refinement.md) | Edge Cases, Testing, Security |
| [Completion.md](Completion.md) | Deployment, CI/CD, Monitoring |
| [Research_Findings.md](Research_Findings.md) | Market & Tech Research |
| [M2.5-cjm-variants.md](M2.5-cjm-variants.md) | CJM with 3 variants + comparison |
| [cjm-interactive.html](cjm-interactive.html) | Interactive HTML CJM prototype |
| [ADR-001 to ADR-010](adr/) | Architectural Decision Records |
| [Microtrends Research](research/fintech-microtrends-russia-2025-2026.md) | 8 fintech microtrends with sources |
