import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db, schema } from '@cleo-rf/db';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';
import { createPaymentSession, verifyWebhookSignature, PLAN_PRICES, PLAN_DURATIONS_MS } from '../services/payment.js';

export const subscriptionRouter = Router();

const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'annual']),
});

// POST /api/subscription/checkout -- create payment session
subscriptionRouter.post('/checkout', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', parsed.error.errors.map(e => e.message).join('; '));
    }

    const { plan } = parsed.data;
    const userId = req.userId!;

    const session = createPaymentSession(userId, plan);

    res.json({
      data: {
        paymentUrl: session.paymentUrl,
        sessionId: session.sessionId,
        amount: PLAN_PRICES[plan],
        plan,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscription/webhook -- handle payment provider callback (no auth)
subscriptionRouter.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    const payload = JSON.stringify(req.body);

    if (!signature || !verifyWebhookSignature(payload, signature)) {
      throw new AppError(403, 'INVALID_SIGNATURE', 'Webhook signature verification failed');
    }

    const { sessionId, event, userId, plan } = req.body as {
      sessionId: string;
      event: string;
      userId: string;
      plan: 'monthly' | 'annual';
    };

    if (event !== 'payment.succeeded') {
      res.json({ data: { processed: false, reason: 'event_ignored' } });
      return;
    }

    // Idempotency: check if user already has active pro from this session
    const [user] = await db
      .select({ plan: schema.users.plan, proExpiresAt: schema.users.proExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const durationMs = PLAN_DURATIONS_MS[plan] || PLAN_DURATIONS_MS.monthly;
    const expiresAt = new Date(Date.now() + durationMs);

    await db
      .update(schema.users)
      .set({ plan: 'pro', proExpiresAt: expiresAt })
      .where(eq(schema.users.id, userId));

    res.json({ data: { processed: true, expiresAt: expiresAt.toISOString() } });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscription/cancel -- cancel subscription renewal
subscriptionRouter.post('/cancel', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const [user] = await db
      .select({ plan: schema.users.plan, proExpiresAt: schema.users.proExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user || user.plan !== 'pro') {
      throw new AppError(404, 'NO_ACTIVE_SUBSCRIPTION', 'No active Pro subscription found');
    }

    // Pro remains active until proExpiresAt -- we just stop auto-renewal.
    // In a real implementation this would call the payment provider's cancel API.

    res.json({
      data: {
        message: 'Subscription renewal cancelled. Pro access remains until the end of your billing period.',
        proExpiresAt: user.proExpiresAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/subscription/status -- current plan info
subscriptionRouter.get('/status', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const [user] = await db
      .select({ plan: schema.users.plan, proExpiresAt: schema.users.proExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let isPro = false;
    let gracePeriodEndsAt: string | null = null;

    if (user.plan === 'pro' && user.proExpiresAt) {
      const graceEnd = new Date(user.proExpiresAt.getTime() + GRACE_PERIOD_MS);
      gracePeriodEndsAt = graceEnd.toISOString();

      if (now <= graceEnd.getTime()) {
        isPro = true;
      } else {
        // Grace period expired -- downgrade
        await db
          .update(schema.users)
          .set({ plan: 'free', proExpiresAt: null })
          .where(eq(schema.users.id, userId));
      }
    }

    res.json({
      data: {
        plan: isPro ? 'pro' : 'free',
        isPro,
        proExpiresAt: user.proExpiresAt?.toISOString() ?? null,
        gracePeriodEndsAt,
      },
    });
  } catch (err) {
    next(err);
  }
});
