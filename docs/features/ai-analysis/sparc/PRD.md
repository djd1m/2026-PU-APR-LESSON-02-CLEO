# PRD: AI Spending Analysis

**Feature ID:** ai-analysis
**Status:** In Development
**Owner:** cleo-rf team
**Last Updated:** 2026-04-08

## Problem Statement

Users upload bank transaction CSVs with raw Russian-language merchant descriptions
(e.g., "OZON.ru", "Пятёрочка", "Яндекс.Такси"). Without categorization, spending
data is unusable for budgeting insights. Manual categorization is impractical for
hundreds of monthly transactions.

## User Story Reference

**US-002** (see Specification.md): As a user, I want my transactions automatically
categorized into spending groups so I can see where my money goes.

## Solution Overview

AI-powered categorization pipeline that processes parsed CSV transactions through
an OpenAI-compatible LLM to assign each transaction to one of 20 predefined
spending categories, then aggregates results into a top-5 breakdown with
percentage allocation.

## Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Categorize transactions into 20 predefined Russian spending categories | MUST |
| FR-02 | Batch transactions in groups of 50 per API call | MUST |
| FR-03 | Return top-5 spending categories with amounts and percentages | MUST |
| FR-04 | Generate pie chart data for category breakdown | SHOULD |
| FR-05 | Fallback to `raw_category` from CSV when AI is unavailable | MUST |
| FR-06 | Support configurable `base_url` and `model_id` per ADR-004 | MUST |

## Spending Categories (20)

Groceries, Restaurants, Transport, Taxi, Entertainment, Subscriptions,
Healthcare, Clothing, Beauty, Education, Utilities, Rent, Telecom,
Travel, Fuel, Electronics, Home, Transfers, Cash Withdrawal, Other.

## Non-Functional Requirements

- **Accuracy:** >85% correct categorization on Russian merchant names
- **Latency:** Full categorization completes within 30 seconds for 500 transactions
- **Resilience:** Single retry on API timeout, then graceful fallback
- **Cost:** Average 1500 tokens per batch of 50 transactions

## API Configuration (ADR-004)

The categorizer uses an OpenAI-compatible endpoint. Both `base_url` and `model_id`
are configurable via environment variables, allowing swap between OpenAI, local
LLM, or any compatible provider without code changes.

```
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL_ID=gpt-4o-mini
AI_API_KEY=sk-...
```

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Categorization accuracy | >85% | Manual audit of 200 random transactions |
| P95 latency (500 txns) | <30s | API response time monitoring |
| Fallback rate | <5% | Percentage of transactions using raw_category |

## Dependencies

- CSV parsing feature (csv-upload) must complete first
- OpenAI-compatible API access
- BullMQ job queue for async processing
