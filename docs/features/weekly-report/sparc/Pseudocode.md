# Pseudocode: Weekly Spending Report

## Cron Job Setup

```typescript
// BullMQ repeatable job — runs every Monday at 10:00 MSK (07:00 UTC)
const WEEKLY_REPORT_CRON = '0 7 * * 1'; // Monday 07:00 UTC = 10:00 MSK

queue.add('weekly-report', {}, {
  repeat: { pattern: WEEKLY_REPORT_CRON },
  jobId: 'weekly-report-recurring',
});
```

## Main Job Processor

```typescript
async function processWeeklyReportJob(): Promise<void> {
  // 1. Fetch all active users who have not opted out
  const users = await getActiveUsersForWeeklyReport();

  // 2. Process each user independently (error isolation)
  for (const user of users) {
    try {
      const report = await generateWeeklyReport(user.id);
      if (!report) continue; // No transactions — skip silently

      const text = formatReportText(report, user.plan);
      await sendNotification(user, text);
    } catch (error) {
      console.error(`Weekly report failed for user ${user.id}:`, error);
      // Continue to next user — never let one failure block others
    }
  }
}
```

## Report Generation

```typescript
async function generateWeeklyReport(userId: string): Promise<WeeklyReport | null> {
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const twoWeeksAgo = subDays(now, 14);

  // Aggregate current week transactions
  const currentWeek = await getTransactionsInRange(userId, weekAgo, now);
  if (currentWeek.length === 0) return null;

  // Aggregate previous week for comparison
  const previousWeek = await getTransactionsInRange(userId, twoWeeksAgo, weekAgo);

  // Build category breakdown
  const categories = aggregateByCategory(currentWeek);
  const prevCategories = aggregateByCategory(previousWeek);

  // Calculate totals
  const totalSpent = sumExpenses(currentWeek);
  const prevTotalSpent = sumExpenses(previousWeek);

  // Top-3 categories
  const topCategories = categories
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // Week-over-week comparison
  const weekChange = totalSpent - prevTotalSpent;
  const weekChangePercent = prevTotalSpent > 0
    ? ((weekChange / prevTotalSpent) * 100)
    : 0;

  // Generate mini-roast via AI (50-150 chars)
  const miniRoast = await generateMiniRoast(totalSpent, topCategories);

  // Subscription alerts (Pro only, retrieved from existing data)
  const subscriptions = await getUpcomingSubscriptions(userId);

  return {
    userId, totalSpent, prevTotalSpent,
    weekChange, weekChangePercent,
    topCategories, categories,
    subscriptions, miniRoast,
  };
}
```

## Mini-Roast Generation

```typescript
const MINI_ROAST_PROMPT = `Ты — саркастичный финансовый бот. Напиши ОЧЕНЬ
  короткий комментарий (50-150 символов) о тратах пользователя за неделю.
  Остроумно, на русском, с Gen Z юмором. Без оскорблений.`;

async function generateMiniRoast(
  totalSpent: number,
  topCategories: CategorySummary[]
): Promise<string> {
  const userMessage = `Потрачено за неделю: ${totalSpent} ₽. ` +
    `Топ: ${topCategories.map(c => `${c.name} ${c.total} ₽`).join(', ')}`;

  const response = await callLLM(MINI_ROAST_PROMPT, userMessage);
  return response.slice(0, 150); // Hard cap
}
```

## Report Formatting

```typescript
function formatReportText(report: WeeklyReport, plan: UserPlan): string {
  const arrow = report.weekChange > 0 ? '↑' : report.weekChange < 0 ? '↓' : '→';
  const lines: string[] = [];

  lines.push(`Еженедельный отчёт Cleo RF`);
  lines.push(`Потрачено: ${report.totalSpent.toLocaleString('ru-RU')} ₽`);
  lines.push(`${arrow} ${Math.abs(report.weekChangePercent).toFixed(0)}% vs прошлая неделя`);
  lines.push('');
  lines.push('Топ-3 категории:');
  for (const cat of report.topCategories) {
    lines.push(`  - ${cat.name}: ${cat.total.toLocaleString('ru-RU')} ₽`);
  }

  if (plan === 'pro' && report.subscriptions.length > 0) {
    lines.push('');
    lines.push('Подписки на этой неделе:');
    for (const sub of report.subscriptions) {
      lines.push(`  - ${sub.name}: ${sub.amount.toLocaleString('ru-RU')} ₽`);
    }
  }

  lines.push('');
  lines.push(report.miniRoast);

  return lines.join('\n');
}
```

## Notification Dispatch (MVP)

```typescript
async function sendNotification(user: User, text: string): Promise<void> {
  // MVP: console.log placeholder
  console.log(`[weekly-report] Notification for ${user.email || user.telegramId}:`);
  console.log(text);

  // TODO: integrate email provider (e.g., Resend, SendGrid)
  // TODO: integrate push notifications
  // TODO: integrate Telegram bot API
}
```
