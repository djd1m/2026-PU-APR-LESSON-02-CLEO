import crypto from 'node:crypto';

// ---------- Constants ----------

export const PLAN_PRICES: Record<string, number> = {
  monthly: 499,
  annual: 3999,
};

export const PLAN_DURATIONS_MS: Record<string, number> = {
  monthly: 30 * 24 * 60 * 60 * 1000,   // 30 days
  annual: 365 * 24 * 60 * 60 * 1000,   // 365 days
};

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'dev-webhook-secret';

// ---------- Types ----------

export interface PaymentSession {
  sessionId: string;
  paymentUrl: string;
  amount: number;
  plan: string;
}

// ---------- Mock Payment Provider ----------
// For MVP: simulates YooMoney payment flow.
// In production: replace the function bodies with real YooMoney or CloudPayments SDK calls.
// The interface (createPaymentSession, verifyWebhookSignature) stays the same.

/**
 * Create a payment session with the payment provider.
 *
 * MVP: returns a mock payment URL pointing to the local callback endpoint.
 * Production: call YooMoney API to create a real payment and return the redirect URL.
 */
export function createPaymentSession(
  userId: string,
  plan: string,
): PaymentSession {
  const sessionId = crypto.randomUUID();
  const amount = PLAN_PRICES[plan] ?? PLAN_PRICES.monthly;

  // In production this would be the YooMoney checkout URL.
  // The mock URL triggers the webhook automatically for development convenience.
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
  const paymentUrl = `${baseUrl}/api/subscription/mock-pay?sessionId=${sessionId}&userId=${userId}&plan=${plan}`;

  return {
    sessionId,
    paymentUrl,
    amount,
    plan,
  };
}

/**
 * Verify the webhook signature from the payment provider.
 *
 * Uses HMAC-SHA256 with timing-safe comparison to prevent timing attacks.
 * The same function works for any provider -- just set the correct WEBHOOK_SECRET.
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Both must be the same length for timingSafeEqual
  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

/**
 * Generate a valid webhook signature for a payload.
 * Used in development/testing to simulate provider webhooks.
 */
export function signPayload(payload: string): string {
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
}
