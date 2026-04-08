import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { db, schema } from '@cleo-rf/db';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';
import { parseCsv } from '../services/csv-parser.js';
import { analysisQueue } from '../queue/index.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.csv') {
      cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only CSV files are accepted'));
      return;
    }
    cb(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post(
  '/',
  authMiddleware,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError(400, 'NO_FILE', 'No file uploaded');
      }

      const userId = req.userId!;
      const buffer = req.file.buffer;
      const filename = req.file.originalname;

      const parsed = parseCsv(buffer, filename);

      if (parsed.transactions.length === 0) {
        throw new AppError(400, 'EMPTY_FILE', 'No transactions found in the uploaded file');
      }

      const dates = parsed.transactions.map(t => t.date).sort((a, b) => a.getTime() - b.getTime());
      const periodStart = dates[0];
      const periodEnd = dates[dates.length - 1];

      const [uploadRecord] = await db.insert(schema.uploads).values({
        userId,
        bankFormat: parsed.bankFormat,
        transactionCount: parsed.transactions.length,
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
        status: 'parsing',
      }).returning({ id: schema.uploads.id });

      await analysisQueue.add('analyze', {
        uploadId: uploadRecord.id,
        userId,
        transactions: parsed.transactions.map(t => ({
          ...t,
          date: t.date.toISOString(),
        })),
        bankFormat: parsed.bankFormat,
      });

      res.status(202).json({
        data: {
          upload_id: uploadRecord.id,
          bank_format: parsed.bankFormat,
          transaction_count: parsed.transactions.length,
          period: {
            start: periodStart.toISOString().split('T')[0],
            end: periodEnd.toISOString().split('T')[0],
          },
          status: 'parsing',
        },
      });
    } catch (err) {
      next(err);
    }
  },
);
