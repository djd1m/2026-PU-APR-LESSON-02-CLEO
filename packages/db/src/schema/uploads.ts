import { pgTable, uuid, varchar, integer, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const bankFormatEnum = pgEnum('bank_format', ['tinkoff', 'sberbank', 'alfa', 'generic']);
export const uploadStatusEnum = pgEnum('upload_status', ['parsing', 'analyzing', 'complete', 'error']);

export const uploads = pgTable('uploads', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bankFormat: bankFormatEnum('bank_format').notNull(),
  transactionCount: integer('transaction_count').default(0).notNull(),
  periodStart: date('period_start'),
  periodEnd: date('period_end'),
  status: uploadStatusEnum('status').default('parsing').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
