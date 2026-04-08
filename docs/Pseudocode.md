# Pseudocode: cleo-rf

**Date:** 2026-04-08

---

## Data Structures

### User
```typescript
type User = {
  id: UUID
  email: string | null
  telegram_id: string | null
  name: string
  age: number
  plan: 'free' | 'pro'
  pro_expires_at: Timestamp | null
  roasts_today: number
  last_roast_date: Date
  referral_code: string
  referred_by: UUID | null
  created_at: Timestamp
}
```

### Transaction
```typescript
type Transaction = {
  id: UUID
  user_id: UUID
  upload_id: UUID
  date: Date
  amount: number          // negative = expense, positive = income
  description: string
  category: string        // AI-assigned
  category_confidence: number
  is_subscription: boolean
  raw_category: string | null  // from bank CSV
  created_at: Timestamp
}
```

### Upload
```typescript
type Upload = {
  id: UUID
  user_id: UUID
  bank_format: 'tinkoff' | 'sberbank' | 'alfa' | 'generic'
  transaction_count: number
  period_start: Date
  period_end: Date
  status: 'parsing' | 'analyzing' | 'complete' | 'error'
  created_at: Timestamp
}
```

### Analysis
```typescript
type Analysis = {
  id: UUID
  user_id: UUID
  upload_id: UUID
  total_income: number
  total_expense: number
  categories: CategoryBreakdown[]
  subscriptions: Subscription[]
  roast_text: string
  recommendations: string[]
  created_at: Timestamp
}

type CategoryBreakdown = {
  name: string
  total: number
  percentage: number
  transaction_count: number
  trend: 'up' | 'down' | 'stable' | null
}

type Subscription = {
  name: string
  amount: number
  frequency: 'monthly' | 'annual'
  last_charge: Date
  is_parasite: boolean   // not used in 30+ days
}
```

### ShareCard
```typescript
type ShareCard = {
  id: UUID
  user_id: UUID
  analysis_id: UUID
  roast_text: string
  image_url: string
  referral_link: string
  share_count: number
  created_at: Timestamp
}
```

---

## Core Algorithms

### Algorithm: CSV Auto-Detect & Parse

```
INPUT: file: Buffer, filename: string
OUTPUT: Transaction[]

STEPS:
1. DETECT encoding:
   - Try UTF-8 decode
   - IF contains replacement chars → try Windows-1251
   - IF still fails → try KOI8-R
   - IF all fail → THROW "Encoding not supported"

2. DETECT delimiter:
   - Read first 5 lines
   - Count occurrences of [';', ',', '\t'] in each line
   - delimiter = char with most consistent count across lines

3. DETECT bank format:
   - Parse header row with detected delimiter
   - MATCH headers against known formats:
     - IF contains "Номер карты" AND "Статус" → 'sberbank'
     - IF contains "Дата операции" AND "Категория" AND "Сумма" → 'tinkoff'
     - IF contains "mcc" → 'alfa'
     - ELSE → 'generic' (require: date, amount, description columns)

4. PARSE transactions:
   - FOR EACH row after header:
     - Extract date → parse with format detection (DD.MM.YYYY / YYYY-MM-DD)
     - Extract amount → parseFloat, handle comma as decimal separator
     - Extract description → trim whitespace
     - Extract category → if available from bank, else null
     - CREATE Transaction object
   - RETURN Transaction[]

COMPLEXITY: O(n) where n = number of rows
ERROR HANDLING: Skip malformed rows, log warnings, continue parsing
```

### Algorithm: AI Spending Analysis

```
INPUT: transactions: Transaction[], user: User
OUTPUT: Analysis

STEPS:
1. AGGREGATE by category:
   - IF transaction has bank category → use it
   - ELSE → call AI for categorization (batch of 50)
   - GROUP BY category → sum amounts, count transactions

2. CALCULATE totals:
   - total_income = SUM(amount WHERE amount > 0)
   - total_expense = ABS(SUM(amount WHERE amount < 0))
   - sort categories by total DESC → take top 10

3. DETECT subscriptions:
   - FIND recurring patterns:
     - GROUP transactions by similar description (fuzzy match, threshold 0.8)
     - FOR EACH group:
       - IF count >= 2 AND dates are ~30 days apart (±5 days)
       - AND amounts are similar (±10%)
       - THEN mark as subscription
   - FOR EACH subscription:
     - is_parasite = (last_charge > 30 days ago) OR (no usage indicator)

4. GENERATE roast:
   - CALL AI with system prompt + spending data
   - INPUT to AI: top categories, subscription parasites, income vs expense ratio
   - VALIDATE: roast length 100-300 chars, contains Russian, no offensive content
   - IF validation fails → retry with adjusted prompt (max 2 retries)

5. GENERATE recommendations:
   - CALL AI with spending data + subscription list
   - Request 3-5 specific, actionable recommendations
   - Each must include estimated savings amount

6. CREATE Analysis object, save to DB
7. RETURN Analysis

COMPLEXITY: O(n) for aggregation + O(1) for AI calls (API)
```

### Algorithm: Subscription Detection (Detail)

```
INPUT: transactions: Transaction[]
OUTPUT: Subscription[]

STEPS:
1. NORMALIZE descriptions:
   - lowercase, remove extra spaces
   - remove transaction IDs, dates from description
   - extract merchant name (first 2-3 meaningful words)

2. GROUP by normalized merchant:
   - fuzzy_group(transactions, similarity_threshold=0.8)
   - USE Levenshtein distance for string matching

3. FOR EACH group with count >= 2:
   a. SORT by date ASC
   b. CALCULATE intervals between consecutive transactions
   c. avg_interval = MEAN(intervals)
   d. IF avg_interval BETWEEN 25-35 days → frequency = 'monthly'
   e. IF avg_interval BETWEEN 350-380 days → frequency = 'annual'
   f. ELSE → not a subscription, skip
   
   g. amount_variance = STDEV(amounts) / MEAN(amounts)
   h. IF amount_variance > 0.2 → not a subscription (variable charges)
   
   i. CREATE Subscription:
      - name = most common description in group
      - amount = MEDIAN(amounts)
      - last_charge = MAX(dates)
      - is_parasite = (today - last_charge > 30 days)

4. RETURN Subscription[]

COMPLEXITY: O(n * m) where n = transactions, m = unique merchants
```

### Algorithm: Share Card Generation

```
INPUT: analysis: Analysis, user: User
OUTPUT: ShareCard

STEPS:
1. SELECT roast text from analysis
2. PREPARE category display:
   - FOR EACH top-3 category:
     - Replace amount with emoji bar (█ per 10% of total)
     - Keep category name visible
3. GENERATE image:
   - Use HTML-to-image (puppeteer or @vercel/og)
   - Template: brand header + roast text + blurred categories + referral CTA
4. UPLOAD image to storage (S3-compatible or local volume)
5. GENERATE referral_link: "cleorf.app/r/{user.referral_code}"
6. CREATE ShareCard, save to DB
7. RETURN ShareCard

COMPLEXITY: O(1) — single image generation
```

---

## API Contracts

### POST /api/upload
Upload CSV for analysis.

```
Request:
  Headers: { Authorization: Bearer <token> }
  Body: multipart/form-data { file: CSV }

Response (202 Accepted):
  {
    "upload_id": "uuid",
    "status": "parsing",
    "message": "Файл принят, анализируем..."
  }

Response (400):
  { "error": { "code": "INVALID_FORMAT", "message": "Формат не распознан" } }

Response (413):
  { "error": { "code": "FILE_TOO_LARGE", "message": "Макс. размер: 10MB" } }
```

### GET /api/analysis/:uploadId
Get analysis results.

```
Request:
  Headers: { Authorization: Bearer <token> }

Response (200):
  {
    "analysis": {
      "id": "uuid",
      "status": "complete",
      "total_income": 85000,
      "total_expense": 67340,
      "categories": [
        { "name": "Фастфуд", "total": 15420, "percentage": 22.9, "count": 18 },
        ...
      ],
      "subscriptions": [
        { "name": "Яндекс.Плюс", "amount": 199, "is_parasite": false },
        { "name": "VK Музыка", "amount": 169, "is_parasite": true },
        ...
      ],
      "roast": "47K на Яндекс.Еду? Ты что, ресторанный критик?",
      "recommendations": [
        { "text": "Отмени VK Музыка — у тебя уже есть Spotify", "savings": 169 },
        ...
      ]
    }
  }

Response (202):
  { "status": "analyzing", "progress": 65 }
```

### POST /api/roast
Request a new roast (rate-limited for free users).

```
Request:
  Headers: { Authorization: Bearer <token> }
  Body: { "analysis_id": "uuid", "style": "roast" | "hype" | "balanced" }

Response (200):
  { "roast": "Знаешь что общего у тебя и Netflix? Вы оба прожигаете деньги.", "remaining_today": 0 }

Response (429):
  { "error": { "code": "DAILY_LIMIT", "message": "1 roast в день. Хочешь ещё? → Pro" } }
```

### POST /api/share
Generate share card.

```
Request:
  Headers: { Authorization: Bearer <token> }
  Body: { "analysis_id": "uuid" }

Response (200):
  {
    "share_card": {
      "image_url": "https://cleorf.app/cards/abc123.png",
      "referral_link": "https://cleorf.app/r/XXXX",
      "share_urls": {
        "vk": "https://vk.com/share.php?url=...",
        "telegram": "https://t.me/share/url?url=...",
        "copy": "https://cleorf.app/r/XXXX"
      }
    }
  }
```

### POST /api/auth/register
```
Request:
  Body: { "email": "user@example.com", "password": "...", "name": "Иван", "age": 22 }

Response (201):
  { "user": { "id": "uuid", "name": "Иван" }, "token": "jwt..." }
```

### POST /api/auth/telegram
```
Request:
  Body: { "telegram_init_data": "..." }

Response (200):
  { "user": { "id": "uuid" }, "token": "jwt..." }
```

---

## State Transitions

### Upload State Machine
```
[created] → [parsing] → [analyzing] → [complete]
                ↓              ↓
            [error]        [error]
```

### User Plan State
```
[free] → [pro] (payment successful)
[pro] → [free] (subscription expired/cancelled)
```

---

## Error Handling Strategy

| Error Category | Response Code | User Message | Logging |
|---------------|:------------:|-------------|---------|
| Invalid CSV format | 400 | "Формат не распознан" | WARN + file sample |
| File too large | 413 | "Макс. размер 10MB" | INFO |
| AI API timeout | 503 | "AI думает... попробуйте через минуту" | ERROR + retry |
| AI content violation | 200 (fallback) | Generic safe roast | WARN + flag for review |
| Rate limit exceeded | 429 | "Лимит исчерпан" | INFO |
| Auth failed | 401 | "Войдите в аккаунт" | WARN |
| Server error | 500 | "Что-то пошло не так" | ERROR + alert |
