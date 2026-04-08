import OpenAI from 'openai';
import { db, schema } from '@cleo-rf/db';
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import type { UserPlan } from '@cleo-rf/shared';

// --- Types ---

export interface CategorySummary {
  name: string;
  total: number;
  count: number;
}

export interface SubscriptionAlert {
  name: string;
  amount: number;
}

export interface WeeklyReport {
  userId: string;
  totalSpent: number;
  prevTotalSpent: number;
  weekChange: number;
  weekChangePercent: number;
  topCategories: CategorySummary[];
  allCategories: CategorySummary[];
  subscriptions: SubscriptionAlert[];
  miniRoast: string;
}

// --- AI Mini-Roast ---

const MINI_ROAST_SYSTEM_PROMPT = `Ты — саркастичный финансовый бот для российской молодёжи. Напиши ОЧЕНЬ короткий комментарий (50-150 символов) о тратах пользователя за неделю. Остроумно, едко, на русском, с Gen Z юмором. Без оскорблений и дискриминации.`;

const MINI_ROAST_FALLBACKS = [
  'Твой кошелёк плачет, но ты не слышишь — наушники же по подписке 🎧',
  'Неделя прошла, деньги тоже. Совпадение? Не думаю.',
  'Финансовая стратегия: потратить всё и не жалеть. Работает!',
];

async function generateMiniRoast(
  totalSpent: number,
  topCategories: CategorySummary[],
): Promise<string> {
  try {
    const openai = new OpenAI();
    const userMessage =
      `Потрачено за неделю: ${totalSpent.toLocaleString('ru-RU')} ₽. ` +
      `Топ: ${topCategories.map((c) => `${c.name} ${c.total.toLocaleString('ru-RU')} ₽`).join(', ')}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: MINI_ROAST_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 100,
      temperature: 0.9,
    });

    const text = response.choices[0]?.message?.content?.trim() || '';
    if (text.length >= 50 && text.length <= 150) {
      return text;
    }
    // If length is off, truncate or use fallback
    if (text.length > 150) return text.slice(0, 147) + '...';
    return MINI_ROAST_FALLBACKS[Math.floor(Math.random() * MINI_ROAST_FALLBACKS.length)];
  } catch {
    return MINI_ROAST_FALLBACKS[Math.floor(Math.random() * MINI_ROAST_FALLBACKS.length)];
  }
}

// --- Data Aggregation ---

function aggregateByCategory(
  transactions: { category: string; amount: string }[],
): CategorySummary[] {
  const map = new Map<string, { total: number; count: number }>();

  for (const t of transactions) {
    const amt = Math.abs(parseFloat(t.amount));
    if (parseFloat(t.amount) >= 0) continue; // Skip income
    const existing = map.get(t.category) || { total: 0, count: 0 };
    existing.total += amt;
    existing.count++;
    map.set(t.category, existing);
  }

  return Array.from(map.entries())
    .map(([name, { total, count }]) => ({ name, total, count }))
    .sort((a, b) => b.total - a.total);
}

function sumExpenses(transactions: { amount: string }[]): number {
  return transactions
    .filter((t) => parseFloat(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
}

// --- Main Generator ---

export async function generateWeeklyReport(
  userId: string,
): Promise<WeeklyReport | null> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const currentWeekTxns = await db
    .select({
      amount: schema.transactions.amount,
      category: schema.transactions.category,
    })
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.userId, userId),
        gte(schema.transactions.date, weekAgo.toISOString().split('T')[0]),
        lt(schema.transactions.date, now.toISOString().split('T')[0]),
      ),
    );

  if (currentWeekTxns.length === 0) return null;

  const previousWeekTxns = await db
    .select({
      amount: schema.transactions.amount,
      category: schema.transactions.category,
    })
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.userId, userId),
        gte(schema.transactions.date, twoWeeksAgo.toISOString().split('T')[0]),
        lt(schema.transactions.date, weekAgo.toISOString().split('T')[0]),
      ),
    );

  const allCategories = aggregateByCategory(currentWeekTxns);
  const topCategories = allCategories.slice(0, 3);

  const totalSpent = sumExpenses(currentWeekTxns);
  const prevTotalSpent = sumExpenses(previousWeekTxns);

  const weekChange = totalSpent - prevTotalSpent;
  const weekChangePercent =
    prevTotalSpent > 0 ? (weekChange / prevTotalSpent) * 100 : 0;

  const miniRoast = await generateMiniRoast(totalSpent, topCategories);

  // Subscription alerts: find subscription transactions in current week
  const subscriptionTxns = await db
    .select({
      description: schema.transactions.description,
      amount: schema.transactions.amount,
    })
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.userId, userId),
        eq(schema.transactions.isSubscription, true),
        gte(schema.transactions.date, weekAgo.toISOString().split('T')[0]),
        lt(schema.transactions.date, now.toISOString().split('T')[0]),
      ),
    );

  const subscriptions: SubscriptionAlert[] = subscriptionTxns.map((t) => ({
    name: t.description,
    amount: Math.abs(parseFloat(t.amount)),
  }));

  return {
    userId,
    totalSpent,
    prevTotalSpent,
    weekChange,
    weekChangePercent,
    topCategories,
    allCategories,
    subscriptions,
    miniRoast,
  };
}

// --- Formatter ---

export function formatReportText(
  report: WeeklyReport,
  plan: UserPlan,
): string {
  const arrow =
    report.weekChange > 0 ? '↑' : report.weekChange < 0 ? '↓' : '→';
  const lines: string[] = [];

  lines.push('Еженедельный отчёт Cleo RF');
  lines.push('─'.repeat(30));
  lines.push(
    `Потрачено: ${report.totalSpent.toLocaleString('ru-RU')} ₽`,
  );
  lines.push(
    `${arrow} ${Math.abs(report.weekChangePercent).toFixed(0)}% vs прошлая неделя`,
  );
  lines.push('');
  lines.push('Топ-3 категории:');
  for (const cat of report.topCategories) {
    lines.push(
      `  - ${cat.name}: ${cat.total.toLocaleString('ru-RU')} ₽ (${cat.count} операций)`,
    );
  }

  if (plan === 'pro') {
    if (report.allCategories.length > 3) {
      lines.push('');
      lines.push('Полная разбивка:');
      for (const cat of report.allCategories) {
        lines.push(
          `  - ${cat.name}: ${cat.total.toLocaleString('ru-RU')} ₽`,
        );
      }
    }

    if (report.subscriptions.length > 0) {
      lines.push('');
      lines.push('Подписки на этой неделе:');
      for (const sub of report.subscriptions) {
        lines.push(
          `  - ${sub.name}: ${sub.amount.toLocaleString('ru-RU')} ₽`,
        );
      }
    }
  }

  lines.push('');
  lines.push(report.miniRoast);

  return lines.join('\n');
}
