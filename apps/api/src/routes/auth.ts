import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, schema } from '@cleo-rf/db';
import { eq } from 'drizzle-orm';
import { signToken } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  age: z.number().int().min(14, 'Must be at least 14 years old').max(120),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', parsed.error.errors.map(e => e.message).join('; '));
    }

    const { email, password, name, age } = parsed.data;

    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError(409, 'EMAIL_EXISTS', 'User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = generateReferralCode();

    const [user] = await db.insert(schema.users).values({
      email,
      passwordHash,
      name,
      age,
      referralCode,
      plan: 'free',
      roastsToday: 0,
    }).returning({
      id: schema.users.id,
      plan: schema.users.plan,
      referralCode: schema.users.referralCode,
    });

    const token = signToken({ userId: user.id, plan: user.plan });

    res.status(201).json({
      data: {
        token,
        user: {
          id: user.id,
          email,
          name,
          plan: user.plan,
          referralCode: user.referralCode,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', parsed.error.errors.map(e => e.message).join('; '));
    }

    const { email, password } = parsed.data;

    const [user] = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        passwordHash: schema.users.passwordHash,
        plan: schema.users.plan,
        referralCode: schema.users.referralCode,
      })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = signToken({ userId: user.id, plan: user.plan });

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          referralCode: user.referralCode,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});
