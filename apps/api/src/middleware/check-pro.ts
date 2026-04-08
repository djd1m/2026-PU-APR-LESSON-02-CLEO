import { Request, Response, NextFunction } from 'express';
import { db, schema } from '@cleo-rf/db';
import { eq } from 'drizzle-orm';

const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

declare global {
  namespace Express {
    interface Request {
      isPro?: boolean;
    }
  }
}

/**
 * Middleware that checks whether the current user has an active Pro subscription.
 *
 * Logic:
 * 1. If user.plan is not 'pro', isPro = false.
 * 2. If proExpiresAt + 3-day grace period > now, isPro = true.
 * 3. If grace period has passed, auto-downgrade user to 'free' in the database.
 *
 * Attaches `req.isPro` (boolean) for downstream route handlers.
 * Does NOT block free users -- handlers decide what to restrict.
 */
export async function checkProStatus(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.userId) {
      req.isPro = false;
      next();
      return;
    }

    const [user] = await db
      .select({ plan: schema.users.plan, proExpiresAt: schema.users.proExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, req.userId))
      .limit(1);

    if (!user || user.plan !== 'pro' || !user.proExpiresAt) {
      req.isPro = false;
      next();
      return;
    }

    const now = Date.now();
    const gracePeriodEnd = user.proExpiresAt.getTime() + GRACE_PERIOD_MS;

    if (now <= gracePeriodEnd) {
      // Still within active period or grace period
      req.isPro = true;
    } else {
      // Grace period expired -- lazy downgrade
      await db
        .update(schema.users)
        .set({ plan: 'free', proExpiresAt: null })
        .where(eq(schema.users.id, req.userId));

      req.isPro = false;
    }

    next();
  } catch (err) {
    // On error, default to non-Pro rather than blocking the request
    req.isPro = false;
    next();
  }
}

/**
 * Guard middleware that returns 403 if the user is not Pro.
 * Use after checkProStatus on routes that require an active Pro subscription.
 */
export function requirePro(req: Request, res: Response, next: NextFunction): void {
  if (!req.isPro) {
    res.status(403).json({
      error: {
        code: 'PRO_REQUIRED',
        message: 'This feature requires a Pro subscription. Upgrade at /api/subscription/checkout.',
      },
    });
    return;
  }
  next();
}
