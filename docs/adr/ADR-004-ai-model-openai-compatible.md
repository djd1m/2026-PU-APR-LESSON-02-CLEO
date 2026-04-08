# ADR-004: AI Model — OpenAI-Compatible API with Configurable base_url + model_id

**Status:** Accepted
**Date:** 2026-04-08
**Decision Makers:** Product Owner

## Context

Cleo uses OpenAI o3 for chain-of-thought reasoning. For the Russian market, we need flexibility to use any LLM provider due to:
- Potential API access restrictions
- Cost optimization
- Data sovereignty concerns
- Ability to switch models without code changes

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **OpenAI-compatible API (configurable)** | Swap models freely, many providers support this, future-proof | Need to test each model's quality |
| OpenAI only | Best quality (GPT-4, o3) | Single vendor dependency, US-based |
| YandexGPT only | Russian provider, data stays in RU | API differs from OpenAI, lock-in |
| Anthropic Claude only | Excellent reasoning | Different API format |
| Self-hosted (Ollama/vLLM) | Full control, no external dependency | Requires GPU hardware, ops complexity |

## Decision

**OpenAI-compatible API** with environment variables:

```env
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL_ID=gpt-4o
AI_API_KEY=sk-...
```

This allows switching between:
- OpenAI (GPT-4o, o3-mini)
- Anthropic via proxy (Claude)
- Local models via Ollama (`http://localhost:11434/v1`)
- Russian providers: GigaChat (with adapter), YandexGPT (with adapter)
- Any OpenRouter model

## Implementation

```typescript
const client = new OpenAI({
  baseURL: process.env.AI_BASE_URL,
  apiKey: process.env.AI_API_KEY,
});

const response = await client.chat.completions.create({
  model: process.env.AI_MODEL_ID,
  messages: [...],
});
```

## Consequences

- System prompts must be model-agnostic (no model-specific tricks)
- Need quality testing suite for each model ("roast quality score")
- Temperature, max_tokens tuned per model via config
- Adapter pattern for non-OpenAI-compatible APIs (YandexGPT, GigaChat)
- Default recommendation: GPT-4o for best roast quality, o3-mini for cost savings
