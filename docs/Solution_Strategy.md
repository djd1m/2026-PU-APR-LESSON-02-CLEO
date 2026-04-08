# Solution Strategy: cleo-rf

**Date:** 2026-04-08

---

## Problem Statement (SCQA)

- **Situation:** 18M Russian Gen Z users spend more than they earn, subscribe to 8+ services, get financial advice from social media
- **Complication:** No AI-powered PFM exists in Russia; existing tools are boring utility trackers with <10% monthly engagement
- **Question:** How to build a PFM that Gen Z actually wants to use daily?
- **Answer:** AI chatbot with personality-driven analysis (Roast Mode) that turns spending data into shareable entertainment

## First Principles Analysis

### Fundamental Truths
1. **People don't change behavior from information alone** — they need emotional trigger
2. **Gen Z engages with content that's shareable** — utility without virality = slow growth
3. **Subscription detection = instant tangible value** — saves money from day 1
4. **CSV is the universal export** — every Russian bank supports it
5. **LLMs can generate culturally-relevant humor** — at $0.01/message cost

### Derived Conclusions
- Roast Mode = emotional trigger + shareable content + genuine insight (3-in-1)
- Free tier must deliver full value to drive word-of-mouth; Pro adds convenience
- CSV parser must handle multiple bank formats automatically (reduce friction)

## Root Cause Analysis (5 Whys)

**Problem:** Gen Z doesn't use existing PFM tools

1. **Why?** → They're boring — just numbers and charts
2. **Why are they boring?** → Designed for utility, not engagement
3. **Why not for engagement?** → PFM devs are finance-first, not entertainment-first
4. **Why does this matter?** → Gen Z's attention goes where entertainment is (TikTok, games)
5. **Root Cause:** → PFM tools compete on features, but Gen Z chooses based on personality and shareability

**Solution:** Build PFM where personality IS the product, data analysis is the engine

## Game Theory Analysis

### Players & Strategies

| Player | Strategy | Our Counter |
|--------|----------|-------------|
| Дзен-мани | Add AI features to existing base | Move faster, personality can't be copied overnight |
| Тинькофф | Launch in-app AI assistant | We're platform-agnostic (CSV from any bank) |
| Сбер (ГигаЧат) | Integrate finance into GigaChat | We're focused; they're a feature of a platform |
| Gen Z Users | Multi-home across apps | Be the "fun one" they keep coming back to |

### Nash Equilibrium
Banks will eventually add AI features, but they'll be corporate and safe. The equilibrium: **banks own utility, we own personality**. No bank will let their AI roast customers.

## Second-Order Effects

| Order | Effect | Timeline |
|:-----:|--------|----------|
| 1st | Users share roasts → organic growth | M1-3 |
| 2nd | Media coverage of "the app that roasts your spending" | M3-6 |
| 3rd | Banks notice and add basic AI — but can't match personality | M6-12 |
| 4th | We become the "anti-bank" brand for Gen Z | M12+ |

## Contradictions Resolved (TRIZ)

| # | Contradiction | Type | TRIZ Principle | Resolution |
|---|-------------|------|----------------|-----------|
| 1 | Need deep analysis (complex) BUT simple UX (easy) | Technical | #1 Segmentation | Chat interface hides complexity; AI does heavy lifting |
| 2 | Price must be HIGH (for economics) AND LOW (for Gen Z) | Physical | Separation in Time | Free tier → build habit → paid after proving value |
| 3 | Humor must be SHARP (funny) BUT not OFFENSIVE (safe) | Technical | #3 Local Quality | AI tuned per user comfort level (Roast/Balanced/Hype modes) |
| 4 | Data must be RICH (for analysis) BUT MINIMAL (for privacy) | Technical | #2 Extraction | Process CSV in-memory, store only aggregates, delete raw data |
| 5 | Need FRESH data BUT CSV is MANUAL | Physical | Separation in Time | Weekly reminder + gamified streak + Open Banking in v2 |

## Recommended Approach

**Strategy: "Personality-Led PFM"**

1. **Lead with entertainment** — Roast Mode first, analysis second
2. **Monetize convenience** — Free analysis is generous; Pro adds automation and depth
3. **Grow through content** — Every roast is a potential viral moment
4. **Defend with data moat** — More users → better category detection → better roasts
5. **Expand through modes** — Roast → Hype → Coach → Voice (v2)

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| Humor falls flat in RU | 30% | HIGH | Pre-launch testing with 20 Gen Z testers, iterate prompts |
| CSV friction kills D7 | 40% | HIGH | Excellent onboarding UX, bank-specific guides, push reminders |
| Competitor copies in 6 mo | 20% | MEDIUM | Brand moat (personality), data moat (categories), community |
| LLM generates offensive content | 15% | HIGH | Content guardrails, human review of edge cases, report button |
| ФЗ-152 compliance issue | 10% | CRITICAL | Legal review, minimal data retention, encryption |
