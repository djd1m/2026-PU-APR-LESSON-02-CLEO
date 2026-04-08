# Pseudocode: Savings Recommendations

## Algorithm: generateRecommendations

```
INPUT: categories: CategoryBreakdown[], subscriptions: Subscription[]
OUTPUT: Recommendation[]

STEPS:
1. BUILD context for AI:
   - Top-5 categories with amounts and percentages
   - All detected subscriptions with amounts
   - Total income vs total expense ratio

2. CHECK for automatic recommendations (no AI needed):
   - IF duplicate music services (Spotify + VK Музыка + Яндекс.Музыка):
     RECOMMEND: "Отмени [cheaper], экономия {amount} руб/мес"
   - IF parasite subscriptions found:
     FOR EACH parasite:
       RECOMMEND: "Отмени {name} — последнее использование {days} дней назад, экономия {amount} руб/мес"

3. CALL AI for personalized recommendations:
   System prompt: "Ты финансовый советник. Дай 3-5 конкретных рекомендаций 
   на русском. Каждая ОБЯЗАНА ссылаться на конкретную категорию или подписку 
   пользователя. Каждая ОБЯЗАНА содержать сумму экономии в рублях. 
   Никаких общих советов типа 'тратьте меньше'."
   
   Parse response as JSON: [{text, savingsRub, category}]

4. VALIDATE recommendations:
   - Each must reference an actual category from user's data
   - Each must have savingsRub > 0 AND savingsRub < totalExpense
   - Filter out any generic recommendations
   - Merge automatic + AI recommendations
   - Limit to 5 total

5. RETURN validated Recommendation[]
```

## AI Prompt Builder

```
INPUT: categories, subscriptions, totalIncome, totalExpense
OUTPUT: string (user message for AI)

FORMAT:
  "Расходы пользователя за месяц:
   Категории: {name}: {amount} руб ({pct}%), ...
   Подписки: {name}: {amount} руб/мес, ...
   Доход: {totalIncome} руб, Расходы: {totalExpense} руб
   
   Дай 3-5 конкретных рекомендаций по экономии."
```
