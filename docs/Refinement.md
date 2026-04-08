# Refinement: cleo-rf

**Date:** 2026-04-08

---

## Edge Cases Matrix

| Scenario | Input | Expected Behavior | Handling |
|----------|-------|-------------------|----------|
| Empty CSV | File with only headers | Show error: "Файл пуст" | Validate row count > 0 |
| Huge CSV | >10MB, 50K+ rows | Reject with size error | Check file size before parsing |
| Mixed encoding | UTF-8 + Windows-1251 chars | Auto-detect encoding | Try multiple decoders, pick best match |
| Unknown bank format | Custom CSV columns | Offer manual column mapping | Fallback to generic parser |
| All income, no expenses | CSV with only salary entries | "Ты только зарабатываешь? Покажи расходы тоже" | Detect and show appropriate message |
| Single transaction | Only 1 row in CSV | Analyze but skip subscription detection | Min 2 transactions for subscription |
| Future dates | Transactions with future dates | Filter out, warn user | Validate date <= today |
| Negative income | Salary as negative number | Auto-detect sign convention per bank | Bank format config handles sign |
| Duplicate upload | Same CSV uploaded twice | Detect duplicates by hash, offer to re-analyze | SHA256 hash of first 100 rows |
| Concurrent uploads | 2 uploads at same time | Queue both, process sequentially | BullMQ handles ordering |
| AI API down | OpenAI returns 5xx | Show cached/generic roast, retry later | Fallback roast templates |
| Offensive roast generated | AI produces inappropriate content | Block, regenerate with safer prompt | Content guardrails + fallback |
| Very low spender | Student spending 5K/mo | Adjust roast tone (don't punch down) | Detect low-income pattern |
| Very high spender | 500K+/mo | Adjust roast (different humor for wealth) | Detect high-income pattern |
| No subscriptions found | No recurring payments | Skip subscription section, focus on categories | Graceful absence |
| Non-Russian descriptions | English or mixed-language merchants | AI handles multilingual categorization | OpenAI handles mixed languages |

## Testing Strategy

### Unit Tests (target: 80% coverage on business logic)

| Module | Test Focus | Framework |
|--------|-----------|-----------|
| csv-parser | Format detection, encoding, delimiter, edge cases | Vitest |
| categorizer | Category assignment accuracy, batch processing | Vitest |
| subscription-detector | Pattern detection, false positive/negative rates | Vitest |
| roast generator | Prompt formatting, guardrails, length validation | Vitest |
| share-card | Image generation, data masking | Vitest |
| auth | JWT creation/validation, Telegram HMAC | Vitest |

### Integration Tests

| Test | Components | Criteria |
|------|-----------|----------|
| Upload flow | API → Parser → DB | CSV parsed, transactions stored |
| Analysis flow | API → Queue → Worker → AI → DB | Analysis completed, roast generated |
| Auth flow | Register → Login → Protected route | JWT issued, routes protected |
| Rate limiting | API → Redis → Response | Free users limited, Pro unlimited |

### E2E Tests (Playwright)

```gherkin
Feature: CSV Upload and Analysis

  Scenario: Successful upload and roast
    Given I am logged in as a free user
    When I upload "scenario-01-student-impulse.csv"
    Then I see "Найдено 62 транзакции за период 01.03 — 31.03"
    And within 15 seconds I see a roast message
    And I see a pie chart with top-5 categories
    And I see detected subscriptions

  Scenario: Subscription detection
    Given I upload "scenario-04-subscription-heavy.csv"
    When the analysis completes
    Then I see at least 15 subscriptions detected
    And I see "подписки-паразиты" section
    And total subscription cost is displayed

  Scenario: Share card generation
    Given I have a completed analysis with roast
    When I click "Поделиться"
    Then a share card image is generated
    And the card shows roast text
    And the card does NOT show actual financial amounts
    And a referral link is included

  Scenario: Free user roast limit
    Given I am a free user who already used today's roast
    When I request another roast
    Then I see a paywall message
    And I see "Pro за 499 руб/мес" CTA

  Scenario: Sberbank CSV format
    Given I upload "scenario-05-sberbank-format.csv"
    When the parser runs
    Then it auto-detects Sberbank format
    And all transactions are correctly parsed
    And categories are assigned
```

### Performance Tests

| Test | Target | Method |
|------|--------|--------|
| CSV parse 1000 rows | < 5s | Load test with sample CSVs |
| AI analysis complete | < 15s | End-to-end timing |
| API response (non-AI) | < 200ms p95 | k6 load test |
| 100 concurrent uploads | No errors | k6 stress test |
| Share card generation | < 3s | Benchmark |

## Performance Optimizations

| Optimization | Where | Impact |
|-------------|-------|--------|
| Batch AI categorization | ai-worker | 50 transactions per API call instead of 1-by-1 |
| Redis caching | API | Cache analysis results for 1 hour |
| Connection pooling | PostgreSQL | PgBouncer reduces connection overhead |
| Lazy loading charts | Frontend | Recharts loaded on scroll |
| Image CDN | Share cards | Serve from CDN, not from API |
| Streaming parsing | CSV parser | Process large files without loading all into memory |

## Security Hardening

| Measure | Implementation |
|---------|---------------|
| Input validation | Zod schemas on all API inputs |
| SQL injection | Drizzle ORM parameterized queries |
| XSS | React auto-escaping + CSP headers |
| CSRF | SameSite cookies + CSRF token |
| Rate limiting | express-rate-limit + Redis store |
| File upload | Max 10MB, CSV extension only, magic bytes check |
| Secrets | .env + Docker secrets, never logged |
| Content safety | AI output guardrails: regex + keyword filter |
| CORS | Whitelist production domain only |

## Technical Debt Items

| Item | Severity | When to Address |
|------|:--------:|----------------|
| Generic parser column mapping UI | Low | v1.0 |
| AI prompt A/B testing framework | Medium | v1.0 |
| Proper i18n (currently hardcoded RU) | Low | v2.0 |
| Database partitioning by user | Low | When >100K users |
| Migrate to managed PostgreSQL | Medium | When VPS limits reached |
