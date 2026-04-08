# PRD: AI Roast Mode (Feature RF-003)

## Overview

AI Roast Mode is the signature feature of Cleo RF — a personality-driven spending commentary engine that delivers sharp, humorous critiques of user spending habits in Russian. The feature transforms dry financial data into memorable, shareable content that drives engagement and retention.

## Problem Statement

Traditional finance apps present spending data as boring tables and charts. Russian Gen Z users want entertainment value from their financial tools. Competitor apps lack any personality layer, leaving an opportunity for viral, personality-driven financial feedback.

## Target Audience

- Russian-speaking users aged 18-30
- Comfortable with internet humor, memes, and sarcasm
- Active on social media (sharing roasts drives organic growth)

## Feature Requirements

### Commentary Styles

| Style | Tone | Example Use Case |
|-------|------|------------------|
| `roast` | Sarcastic, sharp, witty | Default for engaged users |
| `hype` | Positive, encouraging | When user improves spending habits |
| `balanced` | Mix of critique and praise | Default for new users |

### Content Parameters

- **Language:** Russian only (with Gen Z slang adaptation)
- **Length:** 100-300 characters per roast
- **Personalization:** Based on spending categories, subscription count, totals, and trends
- **Cultural fit:** References to Russian internet culture, memes, and relatable situations

### Rate Limiting

| Tier | Daily Roasts | Reset |
|------|-------------|-------|
| Free | 1 per day | Midnight MSK |
| Pro | Unlimited | N/A |

### Content Guardrails

- Sharp humor is encouraged, but content MUST NOT be offensive, discriminatory, or target protected characteristics
- No mocking of poverty or financial hardship — tone adjusts for very low spenders
- Regex + keyword filter as first pass, LLM self-check as second pass
- Fallback to pre-approved template if guardrail triggers
- All generated content logged for periodic human review

## Success Metrics

| Metric | Target |
|--------|--------|
| Daily roast request rate | >60% of DAU |
| Share rate (screenshot/copy) | >15% of roasts |
| Pro conversion from roast paywall | >3% |
| Guardrail trigger rate | <2% of generations |

## Dependencies

- AI Analysis feature (RF-002) must complete spending categorization first
- LLM provider integration (OpenAI API or self-hosted)
- Rate limiting infrastructure (Redis counter)

## Out of Scope

- Multi-language roasts (future consideration)
- Voice-generated roasts
- User-submitted roast templates
