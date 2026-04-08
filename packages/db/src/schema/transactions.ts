import { pgTable, uuid, varchar, date, numeric, real, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { uploads } from './uploads';

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  uploadId: uuid('upload_id').notNull().references(() => uploads.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  category: varchar('category', { length: 100 }).default('Прочее').notNull(),
  categoryConfidence: real('category_confidence').default(0).notNull(),
  isSubscription: boolean('is_subscription').default(false).notNull(),
  rawCategory: varchar('raw_category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_transactions_user_date').on(table.userId, table.date),
  index('idx_transactions_upload').on(table.uploadId),
  index('idx_transactions_category').on(table.userId, table.category),
]);
