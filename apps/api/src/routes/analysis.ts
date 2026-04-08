import { Router, Request, Response, NextFunction } from 'express';
import { db, schema } from '@cleo-rf/db';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const analysisRouter = Router();

analysisRouter.get(
  '/:uploadId',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { uploadId } = req.params;

      const [upload] = await db
        .select()
        .from(schema.uploads)
        .where(and(
          eq(schema.uploads.id, uploadId),
          eq(schema.uploads.userId, userId),
        ))
        .limit(1);

      if (!upload) {
        throw new AppError(404, 'UPLOAD_NOT_FOUND', 'Upload not found');
      }

      if (upload.status !== 'complete') {
        res.status(202).json({
          data: {
            upload_id: uploadId,
            status: upload.status,
            message: upload.status === 'error'
              ? 'Analysis failed, please try re-uploading'
              : 'Analysis is still processing',
          },
        });
        return;
      }

      const [analysis] = await db
        .select()
        .from(schema.analyses)
        .where(and(
          eq(schema.analyses.uploadId, uploadId),
          eq(schema.analyses.userId, userId),
        ))
        .limit(1);

      if (!analysis) {
        throw new AppError(404, 'ANALYSIS_NOT_FOUND', 'Analysis not found for this upload');
      }

      res.json({
        data: {
          id: analysis.id,
          upload_id: analysis.uploadId,
          total_income: Number(analysis.totalIncome),
          total_expense: Number(analysis.totalExpense),
          categories: analysis.categories,
          subscriptions: analysis.subscriptions,
          roast_text: analysis.roastText,
          recommendations: analysis.recommendations,
          created_at: analysis.createdAt.toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);
