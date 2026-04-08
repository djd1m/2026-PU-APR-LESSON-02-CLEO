import type { RoastStyle, CategoryBreakdown, SubscriptionInfo } from '@cleo-rf/shared';

const ROAST_SYSTEM_PROMPT = `Ты — саркастичный финансовый советник для российской молодёжи. Анализируешь расходы и язвительно комментируешь привычки пользователя. Юмор острый но не обидный. Пиши на русском. 100-300 символов.`;

const HYPE_SYSTEM_PROMPT = `Ты — восторженный финансовый коуч для российской молодёжи. Хвалишь пользователя за хорошие привычки, подбадриваешь при плохих. Позитивный тон, без осуждения. Пиши на русском с эмодзи. 100-300 символов.`;

const BALANCED_SYSTEM_PROMPT = `Ты — опытный финансовый советник для российской молодёжи. Даёшь объективный краткий анализ расходов: что хорошо, что можно улучшить. Спокойный профессиональный тон. Пиши на русском. 100-300 символов.`;

export function getRoastPrompt(style: RoastStyle): string {
  switch (style) {
    case 'roast':
      return ROAST_SYSTEM_PROMPT;
    case 'hype':
      return HYPE_SYSTEM_PROMPT;
    case 'balanced':
      return BALANCED_SYSTEM_PROMPT;
    default:
      return ROAST_SYSTEM_PROMPT;
  }
}

export function buildRoastUserMessage(
  categories: CategoryBreakdown[],
  subscriptions: SubscriptionInfo[],
  totals: { income: number; expense: number },
): string {
  const lines: string[] = [];

  lines.push(`Доход за период: ${totals.income.toLocaleString('ru-RU')} ₽`);
  lines.push(`Расходы за период: ${totals.expense.toLocaleString('ru-RU')} ₽`);

  if (totals.income > 0) {
    const savingsRate = ((totals.income - totals.expense) / totals.income * 100).toFixed(1);
    lines.push(`Норма сбережений: ${savingsRate}%`);
  }

  lines.push('');
  lines.push('Топ категорий расходов:');
  const topCategories = categories.slice(0, 5);
  for (const cat of topCategories) {
    lines.push(`- ${cat.name}: ${cat.total.toLocaleString('ru-RU')} ₽ (${cat.percentage}%, ${cat.transactionCount} операций)`);
  }

  if (subscriptions.length > 0) {
    lines.push('');
    lines.push('Подписки:');
    for (const sub of subscriptions) {
      const parasiteTag = sub.isParasite ? ' [ЗАБЫТАЯ!]' : '';
      lines.push(`- ${sub.name}: ${sub.amount.toLocaleString('ru-RU')} ₽/мес${parasiteTag}`);
    }

    const totalSubs = subscriptions.reduce((sum, s) => sum + s.amount, 0);
    lines.push(`Итого подписки: ${totalSubs.toLocaleString('ru-RU')} ₽/мес`);

    const parasites = subscriptions.filter(s => s.isParasite);
    if (parasites.length > 0) {
      const parasiteCost = parasites.reduce((sum, s) => sum + s.amount, 0);
      lines.push(`Забытых подписок: ${parasites.length} на сумму ${parasiteCost.toLocaleString('ru-RU')} ₽/мес`);
    }
  }

  return lines.join('\n');
}
