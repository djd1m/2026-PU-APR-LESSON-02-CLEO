# PRD: cleo-rf — AI Financial Assistant for Gen Z Russia

**Version:** 1.0 | **Date:** 2026-04-08 | **Status:** Draft
**Author:** AI Architect | **Stakeholders:** Product Owner

---

## 1. Executive Summary

cleo-rf is an AI-powered personal finance assistant targeting Russian Gen Z (18-30). It analyzes bank transaction CSVs, identifies spending patterns and forgotten subscriptions, and delivers insights through a personality-driven chatbot with "Roast Mode" — humorous, sharp commentary on spending habits. The product fills a gap left by departing global PFM apps, with no direct AI-powered competitor in the Russian market.

**Key Differentiator:** Financial analysis that's fun and shareable, not boring and forgettable.

## 2. Problem Statement

### SCQA Framework

- **Situation:** Russian Gen Z (18-30, ~18M people) spends more than they earn, has 8+ active subscriptions, and gets financial advice from TikTok
- **Complication:** Existing PFM tools (Дзен-мани, CoinKeeper) are utilitarian trackers — boring, low engagement, no AI analysis. Global AI-powered alternatives (Cleo, Mint) are unavailable in Russia
- **Question:** How do we make financial awareness engaging enough for Gen Z to actually change behavior?
- **Answer:** AI chatbot with personality (Roast Mode) that turns spending analysis into shareable entertainment while delivering genuine savings insights

## 3. Target Users

### Primary: Импульсивный студент (45% of TAM)
- Age: 18-22, income 15-40K RUB/mo
- Pain: "Where does my money go by the 15th?"
- Trigger: Card declined, saw friend's roast screenshot

### Secondary: Фрилансер (30%)
- Age: 22-30, irregular income 50-150K RUB/mo
- Pain: "How do I smooth out income spikes?"
- Trigger: Tax season, unexpected expense

### Tertiary: Офисный работник (25%)
- Age: 23-30, stable salary 60-120K RUB/mo
- Pain: "Help me save for a goal without suffering"
- Trigger: Salary raise, "No Buy" trend

## 4. Feature Matrix

### MVP (v0.1)

| # | Feature | Priority | User Story |
|---|---------|:--------:|-----------|
| F1 | CSV Upload & Parsing | P0 | As a user, I want to upload my bank CSV so the app can analyze my spending |
| F2 | AI Spending Analysis | P0 | As a user, I want to see my top spending categories with AI insights |
| F3 | Roast Mode | P0 | As a user, I want the AI to humorously critique my spending habits |
| F4 | Subscription Detection | P0 | As a user, I want to find forgotten recurring payments |
| F5 | Share Card Generation | P0 | As a user, I want to share my roast on social media |
| F6 | User Auth (email/Telegram) | P0 | As a user, I want to create an account to save my data |
| F7 | Spending Dashboard | P1 | As a user, I want to see charts of my spending over time |
| F8 | Savings Recommendations | P1 | As a user, I want actionable tips to reduce spending |

### v1.0

| # | Feature | Priority |
|---|---------|:--------:|
| F9 | Pro Subscription (499 RUB/mo) | P0 |
| F10 | Unlimited Roasts (Pro) | P0 |
| F11 | Weekly Report (email/push) | P1 |
| F12 | Savings Goals | P1 |
| F13 | Custom Categories | P2 |
| F14 | Hype Mode (positive encouragement) | P2 |

### v2.0 (Roadmap)

| # | Feature | Priority |
|---|---------|:--------:|
| F15 | Open Banking API integration | P1 |
| F16 | Voice Roast Mode | P1 |
| F17 | Peer Comparison (anonymized) | P2 |
| F18 | Financial Health Score | P2 |
| F19 | Group Challenges | P3 |
| F20 | Investment Portfolio Roast | P3 |

## 5. Non-Functional Requirements

| Category | Requirement | Target |
|----------|-----------|--------|
| **Performance** | CSV parse + AI analysis | < 15 seconds for 1000 transactions |
| **Performance** | Page load time | < 2 seconds |
| **Performance** | AI response time | < 5 seconds |
| **Scalability** | Concurrent users | 1000 (MVP), 10K (v1) |
| **Security** | Data encryption | AES-256 at rest, TLS 1.3 in transit |
| **Security** | CSV data retention | User-controlled, delete on request |
| **Privacy** | Share cards | Never expose actual amounts |
| **Availability** | Uptime | 99.5% (MVP), 99.9% (v1) |
| **Localization** | Language | Russian (primary), English UI (secondary) |
| **Compliance** | Legal status | Information service, ФЗ-152 compliant |
| **Accessibility** | WCAG | 2.1 AA minimum |

## 6. Success Metrics

| Metric | Target (M3) | Target (M6) | Target (M12) |
|--------|:-----------:|:-----------:|:------------:|
| Registered users | 500 | 5,000 | 50,000 |
| Monthly active users | 200 | 2,000 | 20,000 |
| CSV uploads/month | 300 | 3,000 | 30,000 |
| Roast shares/month | 100 | 1,500 | 15,000 |
| Paying subscribers | — | 250 | 2,500 |
| MRR | — | 125K RUB | 1.25M RUB |
| D7 retention | > 30% | > 40% | > 50% |
| NPS | > 30 | > 40 | > 50 |
| Free→Paid conversion | — | > 5% | > 8% |

## 7. Technical Constraints (from ADRs)

| Constraint | Decision | ADR |
|-----------|---------|-----|
| Architecture | Distributed Monolith (Monorepo) | ADR-002 |
| Database | PostgreSQL 16 in Docker | ADR-003 |
| AI Model | OpenAI-compatible API (configurable base_url + model_id) | ADR-004 |
| Data Input | CSV upload (MVP), Open Banking API (v2) | ADR-005 |
| Monetization | Freemium, 499 RUB/mo Pro | ADR-006 |
| Regulatory | Information service, no CB license | ADR-007 |
| Deploy | Docker Compose on VPS | ADR-002 |
| Frontend | Next.js | — |

## 8. Risks

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| Roast humor doesn't translate to Russian | Medium | High | Early user testing with RU focus group |
| CSV upload friction kills retention | Medium | High | Excellent UX + weekly reminder pushes |
| Competitor (Tinkoff/Sber) launches similar | Low | High | Speed to market + community + brand personality |
| LLM costs too high at scale | Low | Medium | Configurable model, can switch to cheaper |
| Data privacy incident | Low | Critical | Minimal data retention, encryption, ФЗ-152 compliance |

## 9. Timeline

| Phase | Duration | Deliverables |
|-------|:--------:|-------------|
| MVP Dev | 6-8 weeks | Core features F1-F6, basic UI |
| Beta | 2 weeks | 50 beta testers, feedback iteration |
| v0.1 Launch | Week 10 | Public launch, features F1-F8 |
| v1.0 | Month 3-4 | Pro subscription, F9-F14 |
| v2.0 | Month 6-8 | Open Banking, Voice, F15-F20 |

## 10. Out of Scope (MVP)

- Cash advance / lending (requires CB license)
- Real-time bank connection (Open Banking not ready)
- Investment advice (regulatory risk)
- Multi-currency support
- Family/shared accounts
- Mobile native app (web-first)
