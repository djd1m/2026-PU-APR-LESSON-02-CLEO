import { pgTable, uuid, numeric, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { uploads } from './uploads';

export const analyses = pgTable('analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  uploadId: uuid('upload_id').notNull().references(() => uploads.id, { onDelete: 'cascade' }),
  totalIncome: numeric('total_income', { precision: 12, scale: 2 }).default('0').notNull(),
  totalExpense: numeric('total_expense', { precision: 12, scale: 2 }).default('0').notNull(),
  categories: jsonb('categories').default('[]').notNull(),
  subscriptions: jsonb('subscriptions').default('[]').notNull(),
  roastText: text('roast_text').default('').notNull(),
  recommendations: jsonb('recommendations').default('[]').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_analyses_upload').on(table.uploadId),
]);
