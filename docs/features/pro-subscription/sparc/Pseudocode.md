# Pseudocode: Pro Subscription

## Data Types

```
type SubscriptionPlan = 'monthly' | 'annual'
type SubscriptionStatus = 'active' | 'cancelled' | 'expired'

interface ProSubscription {
  id: UUID
  userId: UUID
  plan: SubscriptionPlan
  status: SubscriptionStatus
  paymentProvider: 'yoomoney' | 'cloudpayments' | 'sbp'
  paymentSessionId: string
  amount: number                // 499 or 3999
  expiresAt: DateTime
  cancelledAt: DateTime | null
  createdAt: DateTime
}

PLAN_PRICES = {
  monthly: 499,
  annual: 3999,
}

PLAN_DURATIONS = {
  monthly: 30 days,
  annual: 365 days,
}

GRACE_PERIOD = 3 days
```

## API: POST /api/subscription/checkout

```
function handleCheckout(req):
  userId = req.userId               // from auth middleware
  plan = validate(req.body.plan)    // 'monthly' | 'annual'

  amount = PLAN_PRICES[plan]
  session = paymentService.createPaymentSession(userId, plan, amount)

  store session in subscriptions table with status = 'pending'

  return { paymentUrl: session.paymentUrl, sessionId: session.sessionId }
```

## API: POST /api/subscription/webhook

```
function handleWebhook(req):
  signature = req.headers['x-webhook-signature']
  payload = req.rawBody

  if not paymentService.verifyWebhookSignature(payload, signature):
    return 403 Forbidden

  sessionId = payload.sessionId
  event = payload.event          // 'payment.succeeded' | 'payment.failed'

  existing = findSubscriptionBySessionId(sessionId)
  if existing and existing.status == 'active':
    return 200 OK               // idempotent: already processed

  if event == 'payment.succeeded':
    plan = existing.plan
    duration = PLAN_DURATIONS[plan]
    expiresAt = now() + duration

    update user: plan = 'pro', proExpiresAt = expiresAt
    update subscription: status = 'active', expiresAt = expiresAt

  return 200 OK
```

## API: POST /api/subscription/cancel

```
function handleCancel(req):
  userId = req.userId

  subscription = findActiveSubscription(userId)
  if not subscription:
    return 404 "No active subscription"

  update subscription: status = 'cancelled', cancelledAt = now()
  // User keeps Pro until proExpiresAt -- no immediate downgrade

  return { message: "Subscription cancelled", proExpiresAt: user.proExpiresAt }
```

## API: GET /api/subscription/status

```
function handleStatus(req):
  userId = req.userId
  user = findUserById(userId)

  isPro = checkProStatus(user)

  return {
    plan: user.plan,
    isPro: isPro,
    proExpiresAt: user.proExpiresAt,
    gracePeriodEndsAt: user.proExpiresAt ? user.proExpiresAt + GRACE_PERIOD : null,
  }
```

## Algorithm: checkProStatus

```
function checkProStatus(user):
  if user.plan != 'pro':
    return false

  if user.proExpiresAt == null:
    return false

  now = currentDateTime()
  gracePeriodEnd = user.proExpiresAt + GRACE_PERIOD

  if now <= gracePeriodEnd:
    return true                 // still within active period or grace period

  // Grace period expired -- downgrade user
  update user: plan = 'free', proExpiresAt = null
  return false
```

## Webhook Signature Verification

```
function verifyWebhookSignature(payload, signature):
  secret = env.PAYMENT_WEBHOOK_SECRET
  expected = HMAC_SHA256(secret, payload)
  return timingSafeEqual(expected, signature)
```
