import { Queue, Worker, type Job } from 'bullmq';
import { db, schema } from '@cleo-rf/db';
import { eq, and, isNull, or, gt } from 'drizzle-orm';
import {
  generateWeeklyReport,
  formatReportText,
} from '../services/weekly-report.js';
import type { UserPlan } from '@cleo-rf/shared';

// --- Configuration ---

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

// Monday 07:00 UTC = 10:00 MSK
const WEEKLY_REPORT_CRON = '0 7 * * 1';

const QUEUE_NAME = 'weekly-report';

// --- Queue Setup ---

export const weeklyReportQueue = new Queue(QUEUE_NAME, {
  connection: REDIS_CONNECTION,
});

/**
 * Register the repeatable weekly report job.
 * Call this once at application startup.
 */
export async function registerWeeklyReportJob(): Promise<void> {
  await weeklyReportQueue.add(
    'send-weekly-reports',
    {},
    {
      repeat: { pattern: WEEKLY_REPORT_CRON },
      jobId: 'weekly-report-recurring',
      removeOnComplete: { count: 10 },
      removeOnFail: { count: 20 },
    },
  );

  console.log(
    `[weekly-report] Repeatable job registered: ${WEEKLY_REPORT_CRON}`,
  );
}

// --- User Fetching ---

interface ReportUser {
  id: string;
  email: string | null;
  telegramId: string | null;
  plan: UserPlan;
}

/**
 * Fetches users eligible for weekly reports:
 * - Has at least one upload (active user)
 * - Has not opted out (weeklyReportEnabled is not explicitly false)
 *
 * MVP: Since user_settings table may not exist yet, we fetch all users
 * who have uploaded at least one statement.
 */
async function getActiveUsersForWeeklyReport(): Promise<ReportUser[]> {
  const usersWithUploads = await db
    .selectDistinct({
      id: schema.users.id,
      email: schema.users.email,
      telegramId: schema.users.telegramId,
      plan: schema.users.plan,
    })
    .from(schema.users)
    .innerJoin(schema.uploads, eq(schema.uploads.userId, schema.users.id));

  // TODO: Filter by user_settings.weeklyReportEnabled when settings table exists
  return usersWithUploads.map((u) => ({
    id: u.id,
    email: u.email,
    telegramId: u.telegramId,
    plan: u.plan as UserPlan,
  }));
}

// --- Notification Dispatch (MVP: console.log) ---

async function sendNotification(
  user: ReportUser,
  text: string,
): Promise<void> {
  const recipient = user.email || user.telegramId || user.id;

  // MVP: Log to console. Replace with real email/push integration.
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`[weekly-report] To: ${recipient} (${user.plan})`);
  console.log('═'.repeat(50));
  console.log(text);
  console.log('═'.repeat(50) + '\n');

  // TODO: Email integration (Resend / SendGrid)
  // await sendEmail({
  //   to: user.email,
  //   subject: 'Еженедельный отчёт Cleo RF',
  //   text,
  // });

  // TODO: Push notification integration
  // TODO: Telegram bot integration
}

// --- Job Processor ---

async function processWeeklyReportJob(job: Job): Promise<void> {
  console.log(`[weekly-report] Job started at ${new Date().toISOString()}`);

  const users = await getActiveUsersForWeeklyReport();
  console.log(`[weekly-report] Processing ${users.length} users`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      const report = await generateWeeklyReport(user.id);

      if (!report) {
        skipCount++;
        continue; // No transactions this week — skip silently
      }

      const text = formatReportText(report, user.plan);
      await sendNotification(user, text);
      successCount++;
    } catch (error) {
      errorCount++;
      console.error(
        `[weekly-report] Failed for user ${user.id}:`,
        error instanceof Error ? error.message : error,
      );
      // Continue to next user — one failure must not block others
    }
  }

  console.log(
    `[weekly-report] Job complete: ${successCount} sent, ${skipCount} skipped, ${errorCount} errors`,
  );
}

// --- Worker Setup ---

export function startWeeklyReportWorker(): Worker {
  const worker = new Worker(QUEUE_NAME, processWeeklyReportJob, {
    connection: REDIS_CONNECTION,
    concurrency: 1, // Process one batch at a time
  });

  worker.on('completed', (job) => {
    console.log(`[weekly-report] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(
      `[weekly-report] Job ${job?.id} failed:`,
      err.message,
    );
  });

  console.log('[weekly-report] Worker started');
  return worker;
}
