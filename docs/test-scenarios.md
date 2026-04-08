# BDD Test Scenarios: cleo-rf

**Date:** 2026-04-08 | **Total scenarios:** 34

---

## Feature: CSV Upload (US-001)

### Happy Path

```gherkin
Scenario: Successfully upload Tinkoff CSV
  Given I am logged in as a registered user
  And I have a Tinkoff CSV file with 62 transactions
  When I upload the file through the upload page
  Then the system detects "tinkoff" format
  And I see "Найдено 62 транзакции за период 01.03 — 31.03"
  And the upload status changes to "analyzing" within 5 seconds

Scenario: Successfully upload Sberbank CSV
  Given I am logged in as a registered user
  And I have a Sberbank CSV file with Windows-1251 encoding
  When I upload the file
  Then the system auto-detects encoding and semicolon delimiter
  And all transactions are parsed correctly
  And categories are mapped from Sberbank naming to standard categories
```

### Error Handling

```gherkin
Scenario: Upload unsupported file format
  Given I am logged in
  When I upload a PDF file
  Then I see error "Поддерживаются только CSV файлы"
  And no upload record is created

Scenario: Upload empty CSV
  Given I am logged in
  When I upload a CSV with only headers and no data rows
  Then I see error "Файл пуст — загрузите выписку с транзакциями"

Scenario: Upload file exceeding size limit
  Given I am logged in
  When I upload a CSV file larger than 10MB
  Then I see error "Максимальный размер файла — 10MB"
  And the file is not stored
```

### Edge Cases

```gherkin
Scenario: CSV with mixed encoding characters
  Given I have a CSV containing both UTF-8 and Windows-1251 characters
  When I upload the file
  Then the system tries UTF-8 first, then falls back to Windows-1251
  And at least 95% of transaction descriptions are readable

Scenario: CSV with unknown column layout
  Given I have a CSV from an unsupported bank
  When the system cannot auto-detect the format
  Then I see a manual column mapping interface
  And I can assign: date, amount, description columns manually
```

### Security

```gherkin
Scenario: Upload without authentication
  Given I am not logged in
  When I send a POST request to /api/upload with a CSV file
  Then I receive 401 Unauthorized
  And no file is processed

Scenario: Attempt to upload executable disguised as CSV
  Given I am logged in
  When I upload a file with .csv extension but executable content
  Then the system validates file content (not just extension)
  And rejects the file with "Формат не распознан"
```

---

## Feature: AI Spending Analysis (US-002)

### Happy Path

```gherkin
Scenario: Complete spending analysis
  Given my CSV with 62 transactions has been parsed
  When the AI analysis completes
  Then I see a pie chart with top-5 spending categories
  And each category shows total amount, percentage, and transaction count
  And the total income and total expenses are displayed
  And the analysis completes within 15 seconds

Scenario: AI categorization of uncategorized transactions
  Given my CSV contains transactions without bank categories
  When the AI categorizer runs
  Then at least 85% of transactions receive correct category assignments
  And each category has a confidence score
```

### Error Handling

```gherkin
Scenario: AI API timeout during analysis
  Given my CSV is being analyzed
  When the AI API does not respond within 30 seconds
  Then the system retries once after 5 seconds
  And if still failing, shows "AI думает... попробуйте через минуту"
  And the analysis status is set to "error" with retry option
```

---

## Feature: Roast Mode (US-003)

### Happy Path

```gherkin
Scenario: First roast for free user
  Given I am a free user with a completed analysis
  And I have not used my daily roast
  When I view my analysis results
  Then I see a personalized roast message in Russian
  And the roast references my top spending category
  And the roast length is between 100 and 300 characters
  And "remaining_today" shows 0

Scenario: Pro user unlimited roasts
  Given I am a Pro user with a completed analysis
  When I request a new roast 5 times
  Then I receive 5 different roast messages
  And none are rate-limited
```

### Error Handling

```gherkin
Scenario: Free user exceeds daily roast limit
  Given I am a free user who already received today's roast
  When I request another roast
  Then I see "1 roast в день. Хочешь ещё?"
  And I see a paywall CTA "Pro за 499 руб/мес"
  And no roast is generated

Scenario: AI generates potentially offensive content
  Given the AI returns a roast containing flagged keywords
  When the content guardrail checks the output
  Then the offensive roast is rejected
  And a safe fallback roast is generated instead
  And the incident is logged for review
```

### Edge Cases

```gherkin
Scenario: Roast for very low spender
  Given my total monthly expenses are under 10,000 RUB
  When a roast is generated
  Then the tone is adjusted (not mocking poverty)
  And the roast focuses on positive habits or quirky patterns
```

### Security

```gherkin
Scenario: Rate limit bypass attempt
  Given I am a free user
  When I send 10 POST requests to /api/roast in 1 minute
  Then only 1 succeeds with a roast
  And 9 return 429 Too Many Requests
  And the rate limit is enforced server-side (not client-side)
```

---

## Feature: Subscription Detection (US-004)

### Happy Path

```gherkin
Scenario: Detect recurring subscriptions
  Given I upload "scenario-04-subscription-heavy.csv" with 19 subscriptions
  When the subscription detector runs
  Then at least 15 subscriptions are correctly identified
  And each shows: name, amount, frequency, last charge date
  And total monthly subscription cost is calculated
  And duplicate services are flagged (e.g., Spotify + VK Музыка)

Scenario: Flag subscription parasites
  Given a subscription was last charged 45 days ago
  When the analysis completes
  Then the subscription is flagged as "паразит"
  And it appears in the "подписки-паразиты" section
```

### Edge Cases

```gherkin
Scenario: No subscriptions found
  Given my CSV contains only one-time purchases
  When the subscription detector runs
  Then the subscription section shows "Подписок не найдено"
  And the analysis continues without subscription data

Scenario: Variable-amount recurring payments
  Given I have rent payments that vary by ±5% each month
  When the detector analyzes them
  Then they are NOT flagged as subscriptions (variance >20%)
  And utilities/rent are excluded from subscription tracking
```

---

## Feature: Share Card (US-005)

### Happy Path

```gherkin
Scenario: Generate and share a roast card
  Given I have a completed analysis with a roast
  When I click "Поделиться"
  Then a share card image is generated within 3 seconds
  And the card displays:
    | Element | Visibility |
    | Roast text | Visible |
    | Category names | Visible |
    | Financial amounts | Blurred/replaced with emoji bars |
    | cleo-rf branding | Visible |
    | Referral link | Visible |
  And share buttons for VK, Telegram, and copy-link are shown
```

### Security

```gherkin
Scenario: Share card never exposes financial data
  Given I generate a share card
  When I inspect the generated image
  Then no actual RUB amounts appear in the image
  And no transaction descriptions appear
  And only the roast text, category names, and relative bars are shown

Scenario: Referral code is non-guessable
  Given user A has referral code "ABCDEF"
  When an attacker tries "ABCDEG", "ABCDEH", etc.
  Then invalid referral codes return a generic landing page
  And no error message reveals valid code patterns
```

---

## Feature: User Authentication (US-006)

### Happy Path

```gherkin
Scenario: Register with email
  Given I am a new user
  When I register with email "test@example.com" and password
  Then my account is created
  And I receive a JWT token
  And I am redirected to the upload page

Scenario: Login via Telegram
  Given I have the Telegram mini-app open
  When I authorize through Telegram
  Then my Telegram ID is verified via HMAC
  And a JWT token is issued
  And my account is linked to my Telegram ID
```

### Security

```gherkin
Scenario: Brute force login prevention
  Given I attempt to login with wrong password
  When I fail 5 times in a row
  Then my account is temporarily locked for 15 minutes
  And I see "Слишком много попыток. Попробуйте через 15 минут"

Scenario: SQL injection in email field
  Given I try to register with email "'; DROP TABLE users;--"
  When the request is processed
  Then the input is sanitized by Zod validation
  And the request is rejected with "Некорректный email"
  And no SQL is executed

Scenario: JWT tampering
  Given I have a valid JWT token
  When I modify the payload and send a request
  Then the server rejects the token with 401
  And the modified token is logged as a security event

Scenario: Expired JWT
  Given my JWT token expired 1 hour ago
  When I make an API request
  Then I receive 401 with "Сессия истекла, войдите снова"
```

---

## Feature: Spending Dashboard (US-007)

### Happy Path

```gherkin
Scenario: View single-month dashboard
  Given I have uploaded one CSV for March 2026
  When I open the dashboard
  Then I see a pie chart of spending by category
  And I see a bar chart of daily spending
  And I see total income vs total expenses

Scenario: View multi-month comparison
  Given I have uploaded CSVs for February and March 2026
  When I open the dashboard
  Then I see month-over-month comparison
  And categories show trend arrows (↑ >10% increase, ↓ >10% decrease, → stable)
```

---

## Feature: Savings Recommendations (US-008)

### Happy Path

```gherkin
Scenario: Receive personalized recommendations
  Given my analysis shows high food delivery spending
  When I view recommendations
  Then I see 3-5 specific recommendations
  And at least one references my food delivery category
  And each includes an estimated monthly savings amount in RUB
  And none are generic ("тратьте меньше")

Scenario: Recommendation for subscription consolidation
  Given my analysis found Spotify (299 RUB) and VK Музыка (169 RUB)
  When I view recommendations
  Then one recommendation suggests canceling the duplicate music service
  And it shows savings of 169 RUB/month (or 299 RUB/month)
```

### Edge Cases

```gherkin
Scenario: Very frugal user with minimal spending
  Given my total expenses are under 15,000 RUB/month
  When recommendations are generated
  Then the AI acknowledges good habits
  And suggests optimization rather than cuts
  And does not shame the user for low spending
```

---

## Cross-Feature Scenarios

```gherkin
Scenario: Complete user journey (end-to-end)
  Given I am a new user
  When I register with email
  And I upload "scenario-01-student-impulse.csv"
  And the analysis completes
  Then I see a roast about my food delivery habits
  And I see 7 subscriptions detected
  And I see 4 savings recommendations
  And I can share the roast as a card
  And the share card contains a valid referral link

Scenario: Returning user with new data
  Given I uploaded a CSV last month
  When I upload a new CSV this month
  Then my dashboard shows month-over-month comparison
  And the roast references my progress (or lack thereof)
  And subscription changes are highlighted
```

---

## Scenario Count Summary

| Feature | Happy | Error | Edge | Security | Total |
|---------|:-----:|:-----:|:----:|:--------:|:-----:|
| CSV Upload | 2 | 3 | 2 | 2 | **9** |
| AI Analysis | 2 | 1 | 0 | 0 | **3** |
| Roast Mode | 2 | 2 | 1 | 1 | **6** |
| Subscription Detection | 2 | 0 | 2 | 0 | **4** |
| Share Card | 1 | 0 | 0 | 2 | **3** |
| User Auth | 2 | 0 | 0 | 4 | **6** |
| Dashboard | 2 | 0 | 0 | 0 | **2** |
| Recommendations | 2 | 0 | 1 | 0 | **3** |
| Cross-Feature | 2 | 0 | 0 | 0 | **2** |
| **Total** | **17** | **6** | **6** | **9** | **38** |
