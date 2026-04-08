# Pseudocode: AI Roast Mode

## System Prompts by Style

```typescript
const SYSTEM_PROMPTS: Record<RoastStyle, string> = {
  roast: `Ты — саркастичный финансовый критик. Твоя задача — остроумно и
    едко прокомментировать траты пользователя на русском языке. Используй
    сленг и юмор, понятный российской аудитории 18-30 лет. Длина: 100-300
    символов. НЕ используй оскорбления, дискриминацию или унижение бедности.`,

  hype: `Ты — восторженный финансовый коуч. Хвали пользователя за его
    траты, находи позитив даже в сомнительных покупках. Используй
    молодёжный сленг и позитивную энергию. Длина: 100-300 символов.`,

  balanced: `Ты — мудрый финансовый друг. Смешивай лёгкую критику с
    похвалой. Будь честным, но доброжелательным. Используй понятный
    молодёжный язык. Длина: 100-300 символов.`
};
```

## Build User Message

```typescript
function buildRoastUserMessage(
  categories: SpendingCategory[],
  subscriptions: Subscription[],
  totals: MonthlyTotals
): string {
  const topCategories = categories
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const subList = subscriptions
    .map(s => `${s.name}: ${s.monthlyAmount} ₽`)
    .join(', ');

  return `
    Общие траты за месяц: ${totals.total} ₽
    Доход (если известен): ${totals.income ?? 'неизвестен'}
    Топ категории: ${topCategories.map(c => `${c.name} — ${c.amount} ₽`).join(', ')}
    Подписки: ${subList || 'нет'}
    Тренд: ${totals.trend} (рост/снижение за последний месяц)
  `.trim();
}
```

## Content Guardrail

```typescript
const BLOCKED_PATTERNS: RegExp[] = [
  /нищ(ий|ета|еброд)/i,
  /бомж/i,
  /лох(ушка)?/i,
  /дебил|идиот|тупой/i,
  /расист|нацист/i,
  // ... extended list from guardrails config
];

const FALLBACK_TEMPLATES: Record<RoastStyle, string[]> = {
  roast: [
    'Твой банковский счёт видел вещи, которые нельзя развидеть. Но мы молчим... пока.',
    'Подписки как грибы после дождя — ты точно всеми пользуешься? 🤔',
  ],
  hype: [
    'Красавчик! Тратишь — значит живёшь. Главное, что с умом... ну почти.',
  ],
  balanced: [
    'В целом неплохо, но пара категорий вызывает вопросы. Давай разберёмся?',
  ],
};

function checkGuardrails(text: string): GuardrailResult {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return { passed: false, reason: `matched: ${pattern.source}` };
    }
  }

  if (text.length < 100 || text.length > 300) {
    return { passed: false, reason: `length: ${text.length}` };
  }

  return { passed: true, reason: null };
}
```

## Rate Limit Check

```typescript
async function checkRoastRateLimit(userId: string): Promise<RateLimitResult> {
  const user = await getUserRoastState(userId);
  const today = getCurrentDateMSK();

  // Reset counter at midnight MSK
  if (user.lastRoastDate !== today) {
    await resetRoastCounter(userId, today);
    return { allowed: true, remaining: user.isPro ? Infinity : 1 };
  }

  if (user.isPro) {
    return { allowed: true, remaining: Infinity };
  }

  if (user.roastsToday >= 1) {
    const nextReset = getNextMidnightMSK();
    return { allowed: false, remaining: 0, nextResetAt: nextReset };
  }

  return { allowed: true, remaining: 1 - user.roastsToday };
}
```

## Main Handler

```typescript
async function generateRoast(
  userId: string,
  style: RoastStyle = 'balanced'
): Promise<RoastResponse> {
  // 1. Rate limit
  const rateCheck = await checkRoastRateLimit(userId);
  if (!rateCheck.allowed) {
    return { type: 'paywall', nextResetAt: rateCheck.nextResetAt };
  }

  // 2. Fetch analysis data
  const analysis = await getLatestAnalysis(userId);
  const userMessage = buildRoastUserMessage(
    analysis.categories, analysis.subscriptions, analysis.totals
  );

  // 3. Adjust style for low spenders
  const effectiveStyle = analysis.totals.total < 15000 ? 'hype' : style;

  // 4. Generate via LLM
  const rawRoast = await callLLM(SYSTEM_PROMPTS[effectiveStyle], userMessage);

  // 5. Guardrail check
  const guardrail = checkGuardrails(rawRoast);
  const finalText = guardrail.passed
    ? rawRoast
    : pickRandomFallback(FALLBACK_TEMPLATES[effectiveStyle]);

  // 6. Persist and increment counter
  await saveRoast(userId, finalText, effectiveStyle, guardrail.passed);
  await incrementRoastCounter(userId);

  return { type: 'roast', text: finalText, style: effectiveStyle };
}
```
