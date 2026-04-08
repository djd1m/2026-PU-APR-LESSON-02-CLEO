import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db, schema } from '@cleo-rf/db';
import { eq, and } from 'drizzle-orm';
import OpenAI from 'openai';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';
import { getRoastPrompt, buildRoastUserMessage } from '../prompts/roast.js';
import type { RoastStyle, CategoryBreakdown, SubscriptionInfo } from '@cleo-rf/shared';

export const roastRouter = Router();

const roastSchema = z.object({
  analysis_id: z.string().uuid('Invalid analysis ID'),
  style: z.enum(['roast', 'hype', 'balanced']),
});

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

roastRouter.post(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = roastSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, 'VALIDATION_ERROR', parsed.error.errors.map(e => e.message).join('; '));
      }

      const userId = req.userId!;
      const plan = req.plan!;
      const { analysis_id, style } = parsed.data;

      // Check rate limit: free users get 1 roast per day
      if (plan === 'free') {
        const [user] = await db
          .select({
            roastsToday: schema.users.roastsToday,
            lastRoastDate: schema.users.lastRoastDate,
          })
          .from(schema.users)
          .where(eq(schema.users.id, userId))
          .limit(1);

        if (user) {
          const today = new Date();
          const isToday = user.lastRoastDate && isSameDay(user.lastRoastDate, today);

          if (isToday && user.roastsToday >= 1) {
            throw new AppError(429, 'RATE_LIMIT', 'Free plan allows 1 roast per day. Upgrade to Pro for unlimited roasts.');
          }
        }
      }

      // Fetch the analysis
      const [analysis] = await db
        .select()
        .from(schema.analyses)
        .where(and(
          eq(schema.analyses.id, analysis_id),
          eq(schema.analyses.userId, userId),
        ))
        .limit(1);

      if (!analysis) {
        throw new AppError(404, 'ANALYSIS_NOT_FOUND', 'Analysis not found');
      }

      const categories = analysis.categories as CategoryBreakdown[];
      const subscriptions = analysis.subscriptions as SubscriptionInfo[];
      const totals = {
        income: Number(analysis.totalIncome),
        expense: Number(analysis.totalExpense),
      };

      // Generate roast via AI
      const openai = new OpenAI({
        baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: process.env.AI_API_KEY || 'missing-key',
      });

      const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL_ID || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: getRoastPrompt(style as RoastStyle) },
          { role: 'user', content: buildRoastUserMessage(categories, subscriptions, totals) },
        ],
        max_tokens: 500,
        temperature: 0.9,
      });

      const roastText = completion.choices[0]?.message?.content?.trim() || 'Не удалось сгенерировать ответ';

      // Update user roast counter
      const today = new Date();
      const [user] = await db
        .select({ lastRoastDate: schema.users.lastRoastDate })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      const isNewDay = !user?.lastRoastDate || !isSameDay(user.lastRoastDate, today);

      await db.update(schema.users)
        .set({
          roastsToday: isNewDay ? 1 : (await db.select({ r: schema.users.roastsToday }).from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0].r + 1,
          lastRoastDate: today,
        })
        .where(eq(schema.users.id, userId));

      res.json({
        data: {
          roastMessage: roastText,
          roastStyle: style,
          analysis_id,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);
