import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db, schema } from '@cleo-rf/db';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const goalsRouter = Router();

// ─── Validation Schemas ─────────────────────────────────────────────

const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  targetAmount: z
    .number()
    .positive('Target amount must be positive')
    .max(999_999_999.99, 'Target amount too large'),
  deadline: z.string().date('Invalid date format').optional(),
});

const updateGoalSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  targetAmount: z.number().positive().max(999_999_999.99).optional(),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').optional(),
  deadline: z.string().date('Invalid date format').nullable().optional(),
});

// ─── Helpers ────────────────────────────────────────────────────────

function calculateProgress(current: string, target: string): number {
  const c = parseFloat(current);
  const t = parseFloat(target);
  if (t <= 0) return 0;
  return Math.min(Math.round((c / t) * 10000) / 100, 100);
}

function daysRemaining(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── GET /api/goals ─────────────────────────────────────────────────

goalsRouter.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const goals = await db
        .select()
        .from(schema.savingsGoals)
        .where(eq(schema.savingsGoals.userId, userId))
        .orderBy(schema.savingsGoals.createdAt);

      const data = goals.map((g) => ({
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline,
        createdAt: g.createdAt.toISOString(),
        progress: calculateProgress(g.currentAmount, g.targetAmount),
        daysRemaining: daysRemaining(g.deadline),
      }));

      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /api/goals ────────────────────────────────────────────────

goalsRouter.post(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const parsed = createGoalSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new AppError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
      }

      const { name, targetAmount, deadline } = parsed.data;

      // Validate deadline is in the future if provided
      if (deadline) {
        const deadlineDate = new Date(deadline);
        if (deadlineDate <= new Date()) {
          throw new AppError(400, 'VALIDATION_ERROR', 'Deadline must be a future date');
        }
      }

      const [goal] = await db
        .insert(schema.savingsGoals)
        .values({
          userId,
          name,
          targetAmount: targetAmount.toFixed(2),
          deadline: deadline ?? null,
        })
        .returning();

      res.status(201).json({
        data: {
          id: goal.id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: goal.deadline,
          createdAt: goal.createdAt.toISOString(),
          progress: 0,
          daysRemaining: daysRemaining(goal.deadline),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── PATCH /api/goals/:id ───────────────────────────────────────────

goalsRouter.patch(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const goalId = req.params.id;
      const parsed = updateGoalSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new AppError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
      }

      // Check ownership
      const [existing] = await db
        .select()
        .from(schema.savingsGoals)
        .where(and(eq(schema.savingsGoals.id, goalId), eq(schema.savingsGoals.userId, userId)));

      if (!existing) {
        throw new AppError(404, 'GOAL_NOT_FOUND', 'Goal not found');
      }

      const updates: Record<string, unknown> = {};
      if (parsed.data.name !== undefined) updates.name = parsed.data.name;
      if (parsed.data.targetAmount !== undefined) updates.targetAmount = parsed.data.targetAmount.toFixed(2);
      if (parsed.data.currentAmount !== undefined) updates.currentAmount = parsed.data.currentAmount.toFixed(2);
      if (parsed.data.deadline !== undefined) updates.deadline = parsed.data.deadline;

      const [updated] = await db
        .update(schema.savingsGoals)
        .set(updates)
        .where(eq(schema.savingsGoals.id, goalId))
        .returning();

      res.json({
        data: {
          id: updated.id,
          name: updated.name,
          targetAmount: updated.targetAmount,
          currentAmount: updated.currentAmount,
          deadline: updated.deadline,
          createdAt: updated.createdAt.toISOString(),
          progress: calculateProgress(updated.currentAmount, updated.targetAmount),
          daysRemaining: daysRemaining(updated.deadline),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── DELETE /api/goals/:id ──────────────────────────────────────────

goalsRouter.delete(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const goalId = req.params.id;

      const [existing] = await db
        .select({ id: schema.savingsGoals.id })
        .from(schema.savingsGoals)
        .where(and(eq(schema.savingsGoals.id, goalId), eq(schema.savingsGoals.userId, userId)));

      if (!existing) {
        throw new AppError(404, 'GOAL_NOT_FOUND', 'Goal not found');
      }

      await db
        .delete(schema.savingsGoals)
        .where(eq(schema.savingsGoals.id, goalId));

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
