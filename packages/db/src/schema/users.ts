import { pgTable, uuid, varchar, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userPlanEnum = pgEnum('user_plan', ['free', 'pro']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique(),
  telegramId: varchar('telegram_id', { length: 64 }).unique(),
  name: varchar('name', { length: 100 }).notNull(),
  age: integer('age').notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  plan: userPlanEnum('plan').default('free').notNull(),
  proExpiresAt: timestamp('pro_expires_at'),
  roastsToday: integer('roasts_today').default(0).notNull(),
  lastRoastDate: timestamp('last_roast_date'),
  referralCode: varchar('referral_code', { length: 16 }).unique().notNull(),
  referredBy: uuid('referred_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
