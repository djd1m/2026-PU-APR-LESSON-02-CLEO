# Test CSV Data for cleo-rf

## Scenarios

| File | Persona | Key Patterns | Expected Roast Focus |
|------|---------|-------------|---------------------|
| `scenario-01-student-impulse.csv` | Student, 20yo, 25K income | 18 food deliveries, 7 subscriptions, impulse buys | Food delivery addiction, subscription overload |
| `scenario-02-freelancer-irregular.csv` | Freelancer, 26yo, irregular income | 3 income spikes, 11 subscriptions, business expenses mixed with personal | Income smoothing, pro tool subscriptions, lifestyle inflation after big payment |
| `scenario-03-office-worker-saver.csv` | Office worker, 27yo, stable 85K x2 | Regular lunch spending, 3 savings transfers, 8 subscriptions | Lunch routine optimization, subscription review, good saving habit reinforcement |
| `scenario-04-subscription-heavy.csv` | Subscription addict, 24yo | 19 active subscriptions = ~6,500 RUB/mo | Subscription overload (main roast target), duplicate services |
| `scenario-05-sberbank-format.csv` | Sberbank export format | Different CSV structure (semicolon, card number, status columns) | Tests parser adaptability for Sberbank format |

## CSV Formats

### T-Bank (Tinkoff) Format (scenarios 01-04)
```
Дата операции;Категория;Сумма;Описание
```
- Delimiter: semicolon
- Encoding: UTF-8
- Date: DD.MM.YYYY
- Amount: negative = expense, positive = income

### Sberbank Format (scenario 05)
```
Дата;Номер карты;Статус;Сумма операции;Валюта операции;Категория;Описание
```
- Extra columns: card number, status, currency
- Category naming differs from T-Bank
- Subscriptions listed as "Прочие списания"

## Expected AI Analysis Results

### Scenario 01 (Student)
- **Top categories:** Food delivery (~15K), Subscriptions (~1.75K), Groceries (~7K)
- **Subscriptions found:** 7 (Яндекс.Плюс, VK Музыка, Spotify, Кинопоиск, Telegram Premium, Яндекс.Музыка, VK Combo, iCloud)
- **Roast angle:** "You spent more on Яндекс.Еда than on groceries. Your kitchen is basically a museum."
- **Savings opportunity:** Cancel duplicate music (Spotify + VK Музыка + Яндекс.Музыка) = 667 RUB/mo

### Scenario 02 (Freelancer)
- **Top categories:** Subscriptions (~5.5K), Dining (~11.8K), Education (12K), Electronics (15K)
- **Subscriptions found:** 11 (Adobe, Figma, Spotify, Notion, Кинопоиск, Telegram, ChatGPT, Midjourney, VK Музыка, iCloud, Яндекс.Музыка[missing])
- **Roast angle:** "Income: irregular. Spending: very regular. That's not how freelancing works."
- **Savings opportunity:** Review pro tools (Adobe + Figma + Midjourney = 2.6K/mo)

### Scenario 03 (Office Worker)
- **Top categories:** Housing (30K+), Groceries (~14K), Lunches (~7K)
- **Positive:** Consistent savings (25K/mo)
- **Roast angle:** "You eat lunch at the same cafeteria every day for 350 RUB. You're a creature of habit. A well-fed creature."
- **Savings opportunity:** 8 subscriptions including duplicates

### Scenario 04 (Subscription Heavy)
- **Critical finding:** 19 subscriptions = ~6,500 RUB/mo = 78,000 RUB/year
- **Duplicates:** 2 music services (Spotify + VK Музыка), streaming overlap
- **Roast angle:** "19 subscriptions. NINETEEN. You're basically funding Silicon Valley single-handedly."
- **Savings opportunity:** Cancel 8+ unused/duplicate subscriptions = ~3,000 RUB/mo
