# Specification: AI Spending Analysis

**Feature:** ai-analysis
**Version:** 1.0
**Last Updated:** 2026-04-08

## User Story US-002

**As a** user who uploaded a bank CSV,
**I want** my transactions automatically categorized by AI into spending groups,
**So that** I can see a top-5 breakdown of where my money goes.

**Story Points:** 8
**Priority:** High (core value proposition)

## Acceptance Criteria (Gherkin)

### AC-1: Top-5 Category Breakdown

```gherkin
Feature: AI Spending Analysis

  Scenario: Successful categorization and breakdown
    Given the CSV has been parsed with 150 expense transactions
    When the AI analysis job completes
    Then the result contains a top-5 spending categories list
    And each category includes the total amount in RUB
    And each category includes a percentage of total spending
    And the categories are sorted by amount descending
    And pie chart data is included in the response
```

### AC-2: AI Categorization Accuracy

```gherkin
  Scenario: Categorization meets accuracy target
    Given 200 uncategorized transactions with Russian merchant names
    When the AI categorizer processes all transactions
    Then at least 85% of transactions match the expected category
    And each transaction is assigned exactly one of the 20 predefined categories
```

### AC-3: Batch Processing

```gherkin
  Scenario: Transactions are batched for API efficiency
    Given 120 transactions to categorize
    When the categorizer runs
    Then it makes exactly 3 API calls (batches of 50, 50, 20)
    And each API call contains a JSON prompt with transaction descriptions
```

### AC-4: API Timeout and Retry

```gherkin
  Scenario: AI API timeout with retry and fallback
    Given the AI API does not respond within 15 seconds
    When the categorizer encounters a timeout
    Then it retries the request once
    And if the retry also fails, transactions in that batch use raw_category
    And the user sees "Часть транзакций не удалось категоризировать автоматически"
```

### AC-5: No Expenses Edge Case

```gherkin
  Scenario: All transactions are income with no expenses
    Given the CSV contains only income transactions (positive amounts)
    When the analysis job completes
    Then the top-5 categories list is empty
    And the user sees "Расходные транзакции не найдены — только доходы"
```

## Data Model

```typescript
interface CategorizedTransaction {
  id: string;
  description: string;        // raw merchant name from CSV
  amount: number;             // negative = expense
  category: string;           // one of 20 predefined categories
  confidence: "ai" | "fallback";
}

interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}
```

## API Contract

**Endpoint:** `GET /api/reports/:reportId/analysis`

**Response (200):**
```json
{
  "topCategories": [
    { "category": "Groceries", "totalAmount": 45200, "percentage": 32.1, "transactionCount": 48 }
  ],
  "totalExpenses": 140800,
  "categorizedCount": 150,
  "fallbackCount": 3,
  "pieChartData": [...]
}
```

## Error States

| Error | HTTP Code | User Message |
|-------|-----------|--------------|
| AI API unreachable after retry | 200 (partial) | Fallback categories used |
| No expenses found | 200 | Income-only message shown |
| Report not found | 404 | "Отчёт не найден" |
| Analysis still processing | 202 | "Анализ в процессе, попробуйте позже" |
