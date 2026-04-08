import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db, schema } from '@cleo-rf/db';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const shareRouter = Router();

const shareSchema = z.object({
  analysis_id: z.string().uuid('Invalid analysis ID'),
});

function blurAmount(amount: number): string {
  const abs = Math.abs(amount);
  if (abs < 1000) return '***';
  const magnitude = Math.pow(10, Math.floor(Math.log10(abs)));
  const rounded = Math.round(abs / magnitude) * magnitude;
  return `~${rounded.toLocaleString('ru-RU')} ₽`;
}

shareRouter.post(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = shareSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, 'VALIDATION_ERROR', parsed.error.errors.map(e => e.message).join('; '));
      }

      const userId = req.userId!;
      const { analysis_id } = parsed.data;

      // Fetch analysis
      const [analysis] = await db
        .select()
        .from(schema.analyses)
        .where(and(
          eq(schema.analyses.id, analysis_id),
          eq(schema.analyses.userId, userId),
        ))
        .limit(1);

      if (!analysis) {
        throw new AppError(404, 'ANALYSIS_NOT_FOUND', 'Analysis not found');
      }

      // Fetch user for referral code
      const [user] = await db
        .select({ referralCode: schema.users.referralCode })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }

      const baseUrl = process.env.APP_BASE_URL || 'https://cleo-rf.app';
      const referralLink = `${baseUrl}/r/${user.referralCode}`;

      // Build share card data with blurred amounts
      const categories = analysis.categories as Array<{
        name: string;
        total: number;
        percentage: number;
        transactionCount: number;
      }>;

      const blurredCategories = categories.map(c => ({
        name: c.name,
        blurred_total: blurAmount(c.total),
        percentage: c.percentage,
      }));

      const roastText = analysis.roastText;
      const imageUrl = `${baseUrl}/api/share/card/${analysis.id}.png`;

      // Save share card record
      const [shareCard] = await db.insert(schema.shareCards).values({
        userId,
        analysisId: analysis_id,
        roastText,
        imageUrl,
        referralLink,
        shareCount: 0,
      }).returning({ id: schema.shareCards.id });

      res.json({
        data: {
          share_id: shareCard.id,
          roast_text: roastText,
          blurred_categories: blurredCategories,
          image_url: imageUrl,
          referral_link: referralLink,
          share_urls: {
            telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(roastText)}`,
            vk: `https://vk.com/share.php?url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent('Мой финансовый рентген от Cleo')}&comment=${encodeURIComponent(roastText)}`,
            copy: referralLink,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
);
