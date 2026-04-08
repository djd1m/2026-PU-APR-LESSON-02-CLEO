# Pseudocode: AI Spending Analysis

**Feature:** ai-analysis
**Last Updated:** 2026-04-08

## Algorithm 1: categorizeTransactions

Categorizes an array of transactions by sending batches to an OpenAI-compatible API.

```
FUNCTION categorizeTransactions(transactions: Transaction[]): CategorizedTransaction[]
  CONST BATCH_SIZE = 50
  CONST CATEGORIES = ["Groceries", "Restaurants", "Transport", "Taxi",
    "Entertainment", "Subscriptions", "Healthcare", "Clothing", "Beauty",
    "Education", "Utilities", "Rent", "Telecom", "Travel", "Fuel",
    "Electronics", "Home", "Transfers", "Cash Withdrawal", "Other"]

  results = []
  batches = splitIntoBatches(transactions, BATCH_SIZE)

  FOR EACH batch IN batches
    prompt = buildCategorizationPrompt(batch, CATEGORIES)

    TRY
      response = callOpenAI(prompt, timeout=15s)
      parsed = parseJsonResponse(response)

      FOR EACH (txn, category) IN zip(batch, parsed.categories)
        IF category IN CATEGORIES THEN
          results.push({ ...txn, category, confidence: "ai" })
        ELSE
          results.push({ ...txn, category: "Other", confidence: "ai" })
        END IF
      END FOR

    CATCH TimeoutError
      // Retry once per AC-4
      TRY
        response = callOpenAI(prompt, timeout=15s)
        parsed = parseJsonResponse(response)
        // same mapping logic as above
        mapAndPushResults(batch, parsed, results, CATEGORIES)
      CATCH ANY
        // Fallback: use raw_category from CSV or "Other"
        FOR EACH txn IN batch
          fallbackCat = txn.raw_category OR "Other"
          results.push({ ...txn, category: fallbackCat, confidence: "fallback" })
        END FOR
      END TRY

    CATCH ParseError
      // AI returned non-JSON or wrong shape
      FOR EACH txn IN batch
        results.push({ ...txn, category: txn.raw_category OR "Other", confidence: "fallback" })
      END FOR
    END TRY
  END FOR

  RETURN results
END FUNCTION
```

## Algorithm 2: buildCategoryBreakdown

Aggregates categorized transactions into a sorted top-5 breakdown.

```
FUNCTION buildCategoryBreakdown(transactions: CategorizedTransaction[]): CategoryBreakdown[]
  // Filter to expenses only (negative amounts)
  expenses = transactions.filter(t => t.amount < 0)

  IF expenses.length == 0 THEN
    RETURN { categories: [], message: "Расходные транзакции не найдены — только доходы" }
  END IF

  totalExpenses = SUM(ABS(t.amount) FOR t IN expenses)

  // Group by category
  grouped = {}
  FOR EACH txn IN expenses
    IF txn.category NOT IN grouped THEN
      grouped[txn.category] = { totalAmount: 0, count: 0 }
    END IF
    grouped[txn.category].totalAmount += ABS(txn.amount)
    grouped[txn.category].count += 1
  END FOR

  // Calculate percentages and sort
  breakdown = []
  FOR EACH (category, data) IN grouped
    breakdown.push({
      category: category,
      totalAmount: data.totalAmount,
      percentage: ROUND(data.totalAmount / totalExpenses * 100, 1),
      transactionCount: data.count
    })
  END FOR

  SORT breakdown BY totalAmount DESC
  RETURN breakdown[0..4]   // top 5
END FUNCTION
```

## Algorithm 3: analyzeJob (BullMQ Processor)

Orchestrates the full analysis pipeline as an async queue job.

```
FUNCTION analyzeJob(job: Job): void
  reportId = job.data.reportId

  // Step 1: Load parsed transactions
  transactions = db.getTransactions(reportId)
  IF transactions.length == 0 THEN
    job.updateStatus("failed", "No transactions found")
    RETURN
  END IF

  // Step 2: AI categorization
  categorized = categorizeTransactions(transactions)
  db.saveCategorizedTransactions(reportId, categorized)

  // Step 3: Build breakdown
  breakdown = buildCategoryBreakdown(categorized)

  // Step 4: Generate spending roast (separate AI call)
  roastPrompt = buildRoastPrompt(breakdown, transactions.length)
  roast = callOpenAI(roastPrompt, timeout=20s) OR "Анализ недоступен"

  // Step 5: Persist results
  fallbackCount = categorized.count(t => t.confidence == "fallback")
  db.saveAnalysisResult(reportId, {
    topCategories: breakdown,
    totalExpenses: SUM(ABS(t.amount) FOR t IN categorized WHERE t.amount < 0),
    categorizedCount: categorized.length,
    fallbackCount: fallbackCount,
    roast: roast,
    pieChartData: buildPieChart(breakdown)
  })

  job.updateStatus("completed")
END FUNCTION
```

## Helper: buildCategorizationPrompt

```
FUNCTION buildCategorizationPrompt(batch, categories): string
  RETURN """
    Ты финансовый аналитик. Категоризируй каждую транзакцию.
    Допустимые категории: {categories.join(", ")}
    Транзакции: {batch.map(t => t.description).join("\n")}
    Ответь JSON: { "categories": ["cat1", "cat2", ...] }
  """
END FUNCTION
```
