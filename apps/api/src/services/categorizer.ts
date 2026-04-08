import OpenAI from 'openai';
import { SPENDING_CATEGORIES } from '@cleo-rf/shared';
import type { ParsedTransaction } from './csv-parser.js';

export interface CategorizedTransaction extends ParsedTransaction {
  category: string;
  categoryConfidence: number;
}

const BATCH_SIZE = 50;

const SYSTEM_PROMPT = `Ты — категоризатор банковских транзакций. Получаешь список транзакций из российских банков.

Для каждой транзакции определи категорию из этого списка:
${SPENDING_CATEGORIES.join(', ')}

Если транзакция положительная (зачисление) — категория "Зарплата" или "Переводы" в зависимости от описания.

Ответь строго в формате JSON-массива, где каждый элемент:
{"index": <номер транзакции>, "category": "<категория>", "confidence": <0.0-1.0>}

Не добавляй пояснений, только JSON.`;

function buildBatchPrompt(transactions: ParsedTransaction[], startIndex: number): string {
  const lines = transactions.map((t, i) => {
    const sign = t.amount >= 0 ? '+' : '';
    return `${startIndex + i}. "${t.description}" ${sign}${t.amount} руб. (${t.rawCategory || 'без категории'})`;
  });
  return lines.join('\n');
}

interface AICategoryResult {
  index: number;
  category: string;
  confidence: number;
}

export async function categorizeTransactions(
  transactions: ParsedTransaction[],
): Promise<CategorizedTransaction[]> {
  const openai = new OpenAI({
    baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.AI_API_KEY || 'missing-key',
  });

  const modelId = process.env.AI_MODEL_ID || 'gpt-4o-mini';
  const results: CategorizedTransaction[] = [];

  // If we already have raw categories from the bank, use them with high confidence
  // Only call AI for transactions without categories
  const needsAI: { index: number; transaction: ParsedTransaction }[] = [];
  const categoriesSet = new Set(SPENDING_CATEGORIES as readonly string[]);

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (t.rawCategory && categoriesSet.has(t.rawCategory)) {
      results.push({
        ...t,
        category: t.rawCategory,
        categoryConfidence: 1.0,
      });
    } else {
      needsAI.push({ index: i, transaction: t });
    }
  }

  // Batch-process transactions that need AI categorization
  for (let batchStart = 0; batchStart < needsAI.length; batchStart += BATCH_SIZE) {
    const batch = needsAI.slice(batchStart, batchStart + BATCH_SIZE);
    const batchTransactions = batch.map(b => b.transaction);

    try {
      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildBatchPrompt(batchTransactions, 0) },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      });

      const content = completion.choices[0]?.message?.content?.trim() || '[]';

      // Extract JSON from possible markdown code blocks
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      let aiResults: AICategoryResult[];
      try {
        aiResults = JSON.parse(jsonStr);
      } catch {
        // If parsing fails, assign default category
        aiResults = [];
      }

      const aiMap = new Map<number, AICategoryResult>();
      for (const r of aiResults) {
        aiMap.set(r.index, r);
      }

      for (let j = 0; j < batch.length; j++) {
        const { transaction } = batch[j];
        const aiResult = aiMap.get(j);

        results.push({
          ...transaction,
          category: aiResult?.category && categoriesSet.has(aiResult.category)
            ? aiResult.category
            : (transaction.rawCategory || 'Прочее'),
          categoryConfidence: aiResult?.confidence ?? 0.5,
        });
      }
    } catch (error) {
      // On AI failure, use raw categories or default
      for (const { transaction } of batch) {
        results.push({
          ...transaction,
          category: transaction.rawCategory || 'Прочее',
          categoryConfidence: transaction.rawCategory ? 0.7 : 0.3,
        });
      }
      console.error('[categorizer] AI batch failed:', error);
    }
  }

  // Sort back to original order
  return results;
}
