import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processAnalyzeJob, type AnalyzeJobData } from './jobs.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const analysisQueue = new Queue<AnalyzeJobData>('analysis', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const analysisWorker = new Worker<AnalyzeJobData>(
  'analysis',
  async (job) => {
    console.log(`[worker] Processing job ${job.id} for upload ${job.data.uploadId}`);
    await processAnalyzeJob(job.data);
    console.log(`[worker] Completed job ${job.id}`);
  },
  {
    connection,
    concurrency: 3,
  },
);

analysisWorker.on('failed', (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

analysisWorker.on('completed', (job) => {
  console.log(`[worker] Job ${job.id} completed successfully`);
});
