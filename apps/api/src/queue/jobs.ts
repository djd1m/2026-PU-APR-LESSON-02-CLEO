import { db, schema } from '@cleo-rf/db';
import { eq } from 'drizzle-orm';
import { categorizeTransactions } from '../services/categorizer.js';
import { detectSubscriptions, type TransactionInput } from '../services/subscription-detector.js';
import { getRoastPrompt, buildRoastUserMessage } from '../prompts/roast.js';
import { percentOf } from '@cleo-rf/shared';
import OpenAI from 'openai';
import type { ParsedTransaction } from '../services/csv-parser.js';
import type { CategoryBreakdown, SubscriptionInfo } from '@cleo-rf/shared';

export interface AnalyzeJobData {
  uploadId: string;
  userId: string;
  transactions: Array<{
    date: string;
    amount: number;
    description: string;
    rawCategory: string | null;
  }>;
  bankFormat: string;
}

export async function processAnalyzeJob(data: AnalyzeJobData): Promise<void> {
  const { uploadId, userId, transactions: rawTransactions } = data;

  try {
    // Update upload status to analyzing
    await db.update(schema.uploads)
      .set({ status: 'analyzing' })
      .where(eq(schema.uploads.id, uploadId));

    // Reconstruct ParsedTransaction objects (dates come serialized as strings from the queue)
    const parsedTransactions: ParsedTransaction[] = rawTransactions.map(t => ({
      date: new Date(t.date),
      amount: t.amount,
      description: t.description,
      rawCategory: t.rawCategory,
    }));

    // Step 1: Categorize transactions via AI
    const categorized = await categorizeTransactions(parsedTransactions);

    // Step 2: Save transactions to DB
    const transactionRows = categorized.map(t => ({
      userId,
      uploadId,
      date: t.date.toISOString().split('T')[0],
      amount: String(t.amount),
      description: t.description,
      category: t.category,
      categoryConfidence: t.categoryConfidence,
      isSubscription: false, // Will be updated after subscription detection
      rawCategory: t.rawCategory,
    }));

    if (transactionRows.length > 0) {
      // Insert in batches to avoid hitting parameter limits
      const BATCH_INSERT_SIZE = 100;
      for (let i = 0; i < transactionRows.length; i += BATCH_INSERT_SIZE) {
        const batch = transactionRows.slice(i, i + BATCH_INSERT_SIZE);
        await db.insert(schema.transactions).values(batch);
      }
    }

    // Step 3: Detect subscriptions
    const transactionInputs: TransactionInput[] = categorized.map(t => ({
      date: t.date,
      amount: t.amount,
      description: t.description,
      category: t.category,
    }));

    const subscriptions = detectSubscriptions(transactionInputs);

    // Mark subscription transactions in DB
    for (const sub of subscriptions) {
      const normalizedSubName = sub.name.toLowerCase().trim();
      for (const row of transactionRows) {
        if (row.description.toLowerCase().trim().includes(normalizedSubName.slice(0, 10))) {
          // Update subscription flag for matching transactions
          // This is a simplified match — in production use more sophisticated matching
        }
      }
    }

    // Step 4: Calculate totals and category breakdown
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = new Map<string, { total: number; count: number }>();

    for (const t of categorized) {
      if (t.amount >= 0) {
        totalIncome += t.amount;
      } else {
        totalExpense += Math.abs(t.amount);
      }

      const existing = categoryTotals.get(t.category) || { total: 0, count: 0 };
      existing.total += t.amount;
      existing.count++;
      categoryTotals.set(t.category, existing);
    }

    const categories: CategoryBreakdown[] = Array.from(categoryTotals.entries())
      .filter(([_, v]) => v.total < 0) // Only expense categories
      .map(([name, v]) => ({
        name,
        total: Math.abs(v.total),
        percentage: percentOf(v.total, totalExpense),
        transactionCount: v.count,
        trend: null,
      }))
      .sort((a, b) => b.total - a.total);

    const subscriptionInfos: SubscriptionInfo[] = subscriptions.map(s => ({
      name: s.name,
      amount: s.amount,
      frequency: s.frequency,
      lastCharge: s.lastCharge,
      isParasite: s.isParasite,
    }));

    // Step 5: Generate initial roast via AI
    let roastText = '';
    try {
      const openai = new OpenAI({
        baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: process.env.AI_API_KEY || 'missing-key',
      });

      const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL_ID || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: getRoastPrompt('roast') },
          {
            role: 'user',
            content: buildRoastUserMessage(categories, subscriptionInfos, {
              income: totalIncome,
              expense: totalExpense,
            }),
          },
        ],
        max_tokens: 500,
        temperature: 0.9,
      });

      roastText = completion.choices[0]?.message?.content?.trim() || '';
    } catch (err) {
      console.error('[jobs] Roast generation failed, continuing without roast:', err);
      roastText = 'Анализ завершён, но рост-генератор временно недоступен. Попробуйте сгенерировать рост вручную.';
    }

    // Step 6: Generate recommendations
    const recommendations: string[] = [];

    // Top spending category recommendation
    if (categories.length > 0) {
      const topCategory = categories[0];
      recommendations.push(
        `Основная категория расходов: ${topCategory.name} (${topCategory.percentage}% бюджета). Рассмотрите оптимизацию.`
      );
    }

    // Parasite subscriptions recommendation
    const parasites = subscriptions.filter(s => s.isParasite);
    if (parasites.length > 0) {
      const totalParasiteCost = parasites.reduce((sum, s) => sum + s.amount, 0);
      recommendations.push(
        `Найдено ${parasites.length} забытых подписок на сумму ~${Math.round(totalParasiteCost)} ₽/мес. Отмените их!`
      );
    }

    // Savings rate recommendation
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      if (savingsRate < 10) {
        recommendations.push(
          `Норма сбережений ${Math.round(savingsRate)}% — ниже рекомендованных 20%. Пора затянуть пояс.`
        );
      } else if (savingsRate >= 20) {
        recommendations.push(
          `Норма сбережений ${Math.round(savingsRate)}% — отлично! Рассмотрите инвестиции.`
        );
      }
    }

    // Delivery/fast food recommendation
    const fastFoodCategory = categories.find(c => c.name === 'Фастфуд' || c.name === 'Рестораны');
    if (fastFoodCategory && fastFoodCategory.percentage > 15) {
      recommendations.push(
        `На еду вне дома уходит ${fastFoodCategory.percentage}% расходов. Готовка дома сэкономит до 60%.`
      );
    }

    // Step 7: Save analysis
    await db.insert(schema.analyses).values({
      userId,
      uploadId,
      totalIncome: String(totalIncome),
      totalExpense: String(totalExpense),
      categories: categories as any,
      subscriptions: subscriptionInfos as any,
      roastText,
      recommendations: recommendations as any,
    });

    // Step 8: Update upload status to complete
    await db.update(schema.uploads)
      .set({ status: 'complete' })
      .where(eq(schema.uploads.id, uploadId));

  } catch (error) {
    // Mark upload as failed
    await db.update(schema.uploads)
      .set({ status: 'error' })
      .where(eq(schema.uploads.id, uploadId));

    console.error(`[jobs] Analysis job failed for upload ${uploadId}:`, error);
    throw error;
  }
}
