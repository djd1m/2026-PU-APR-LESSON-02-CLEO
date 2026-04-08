import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db, schema } from '@cleo-rf/db';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const settingsRouter = Router();

// --- Validation Schemas ---

const updateSettingsSchema = z.object({
  weeklyReportEnabled: z.boolean().optional(),
  notificationChannel: z.enum(['email', 'push', 'telegram']).optional(),
});

// --- Types ---

interface UserSettings {
  weeklyReportEnabled: boolean;
  notificationChannel: 'email' | 'push' | 'telegram';
}

const DEFAULT_SETTINGS: UserSettings = {
  weeklyReportEnabled: true,
  notificationChannel: 'email',
};

// --- In-Memory Store (MVP) ---
// TODO: Replace with user_settings DB table and migration
// CREATE TABLE user_settings (
//   user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
//   weekly_report_enabled BOOLEAN NOT NULL DEFAULT true,
//   notification_channel VARCHAR(20) NOT NULL DEFAULT 'email',
//   updated_at TIMESTAMP NOT NULL DEFAULT NOW()
// );

const settingsStore = new Map<string, UserSettings>();

// --- GET /api/settings ---

settingsRouter.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      // Verify user exists
      const [user] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }

      const settings = settingsStore.get(userId) || { ...DEFAULT_SETTINGS };

      res.json({
        data: {
          weeklyReportEnabled: settings.weeklyReportEnabled,
          notificationChannel: settings.notificationChannel,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// --- PATCH /api/settings ---

settingsRouter.patch(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const parsed = updateSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          parsed.error.errors.map((e) => e.message).join('; '),
        );
      }

      const updates = parsed.data;

      // Verify user exists
      const [user] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }

      // Upsert settings
      const current = settingsStore.get(userId) || { ...DEFAULT_SETTINGS };
      const updated: UserSettings = {
        weeklyReportEnabled:
          updates.weeklyReportEnabled ?? current.weeklyReportEnabled,
        notificationChannel:
          updates.notificationChannel ?? current.notificationChannel,
      };

      settingsStore.set(userId, updated);

      console.log(
        `[settings] Updated for user ${userId}:`,
        JSON.stringify(updated),
      );

      res.json({
        data: {
          weeklyReportEnabled: updated.weeklyReportEnabled,
          notificationChannel: updated.notificationChannel,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
