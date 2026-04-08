# Specification: cleo-rf

**Date:** 2026-04-08

---

## User Stories (MVP)

### US-001: CSV Upload
```
As a user,
I want to upload my bank transaction CSV,
So that the app can analyze my spending patterns.

Acceptance Criteria:
Given I have a CSV file from Sberbank, Tinkoff, or Alfa-Bank
When I upload it through the web interface
Then the system auto-detects bank format, encoding, and delimiter
And parses all transactions within 5 seconds for files up to 10MB
And shows a confirmation: "Найдено X транзакций за период DD.MM — DD.MM"

Given I upload an unsupported file format
When the parser cannot detect the format
Then I see an error: "Формат не распознан. Поддерживаемые банки: Сбер, Тинькофф, Альфа"
And I am offered a manual column mapping option
```

### US-002: AI Spending Analysis
```
As a user,
I want to see my spending breakdown by category,
So that I understand where my money goes.

Acceptance Criteria:
Given my CSV has been successfully parsed
When the analysis is complete
Then I see a pie chart with top-5 spending categories
And each category shows total amount and percentage
And categories are auto-detected from transaction descriptions via AI
And the analysis completes within 15 seconds
```

### US-003: Roast Mode
```
As a user,
I want the AI to roast my spending habits,
So that I get motivated to change through humor.

Acceptance Criteria:
Given my spending data has been analyzed
When I view the results
Then I see a personalized, humorous "roast" message in Russian
And the roast references my actual top spending categories
And the roast is culturally appropriate for Russian Gen Z
And the tone is sharp but never offensive or discriminatory
And free users get 1 roast per day, Pro users get unlimited

Given I request a new roast
When I am a free user and already used my daily roast
Then I see a paywall: "Хочешь ещё? Подключи Pro за 499 руб/мес"
```

### US-004: Subscription Detection
```
As a user,
I want to find recurring subscriptions in my transactions,
So that I can cancel ones I forgot about.

Acceptance Criteria:
Given my CSV contains recurring payments
When the analysis runs
Then the system identifies payments that recur monthly (±3 days)
And groups them with: name, amount, frequency, last charge date
And calculates total monthly and annual subscription cost
And flags subscriptions not used in 30+ days as "паразиты"
```

### US-005: Share Card
```
As a user,
I want to share my roast on social media,
So that my friends see it and try the app.

Acceptance Criteria:
Given I have received a roast
When I tap "Поделиться"
Then a share card image is generated with:
  - Roast text (visible)
  - Spending amounts replaced with blur/emojis
  - cleo-rf branding and referral link
And I can share to: VK, Telegram, copy link
And the referral link tracks the source user
```

### US-006: User Authentication
```
As a user,
I want to create an account,
So that my data is saved between sessions.

Acceptance Criteria:
Given I am a new user
When I sign up with email or Telegram
Then my account is created
And my uploaded CSV data is associated with my account
And I can log in from any device

Given I sign up via Telegram
When I authorize the Telegram bot
Then my account is linked to my Telegram ID
And I receive notifications via Telegram
```

### US-007: Spending Dashboard
```
As a user,
I want to see charts of my spending over time,
So that I can track my progress.

Acceptance Criteria:
Given I have uploaded CSVs for 2+ months
When I view the dashboard
Then I see month-over-month comparison charts
And I see trend indicators (↑ spending increased, ↓ decreased)
And each category is clickable for detailed transactions
```

### US-008: Savings Recommendations
```
As a user,
I want actionable tips to reduce spending,
So that I can save more money.

Acceptance Criteria:
Given my spending has been analyzed
When I view recommendations
Then I see 3-5 specific, actionable suggestions
And each suggestion includes estimated monthly savings
And suggestions are personalized based on my actual data
And the AI avoids generic advice like "spend less"
```

---

## Non-Functional Requirements (Detail)

### NFR-001: Performance
- CSV parsing: < 5s for 1000 rows
- AI analysis + roast generation: < 15s total
- Page load (cached): < 2s
- API response (non-AI): < 200ms p95

### NFR-002: Security
- All data encrypted at rest (AES-256)
- TLS 1.3 for all connections
- Raw CSV data: deleted after analysis (store only aggregates)
- Password hashing: bcrypt with cost factor 12
- Rate limiting: 100 req/min per user
- CSRF protection on all forms

### NFR-003: Privacy (ФЗ-152)
- Privacy policy in Russian
- User consent before data processing
- Right to delete all data
- Data stored on Russian-located servers (VPS)
- Share cards never contain real financial amounts
- No analytics tracking without consent

### NFR-004: Scalability
- MVP: single VPS, 1000 concurrent users
- v1: horizontal scaling via Docker Compose replicas
- Database: connection pooling via PgBouncer
- AI calls: queue-based with retry logic

### NFR-005: Monitoring
- Application logs: structured JSON
- Error tracking: Sentry
- Uptime monitoring: external healthcheck
- AI cost tracking: per-user, per-request
