import { pgTable, uuid, text, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { analyses } from './analyses.js';

export const shareCards = pgTable('share_cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  analysisId: uuid('analysis_id').notNull().references(() => analyses.id, { onDelete: 'cascade' }),
  roastText: text('roast_text').notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  referralLink: varchar('referral_link', { length: 200 }).notNull(),
  shareCount: integer('share_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
