# PRD: Pro Subscription Tier

## Overview

Cleo-RF is an AI financial assistant for Russian Gen Z. The Pro subscription tier
monetizes the platform by offering premium features at 499 RUB/month or 3999 RUB/year
(~33% annual discount). Payment processing integrates with Russian payment providers.

## Problem Statement

Free users are limited to 3 roasts per day and basic analysis. Power users who want
deeper financial insights, unlimited roasts, and advanced tracking have no upgrade path.

## Target Audience

- Gen Z users (18-25) in Russia who actively track personal finances
- Users who hit the free roast limit and want more
- Users who need subscription tracking alerts and weekly reports

## Pricing

| Plan     | Price           | Billing     |
|----------|-----------------|-------------|
| Free     | 0 RUB           | N/A         |
| Pro (mo) | 499 RUB/month   | Recurring   |
| Pro (yr) | 3999 RUB/year   | Recurring   |

## Pro Features Unlocked

1. **Unlimited roasts** -- no daily limit on financial roast generation
2. **Advanced AI insights** -- deeper spending pattern analysis with trend predictions
3. **Subscription tracker alerts** -- push notifications when parasitic subscriptions charge
4. **Weekly financial reports** -- automated spending summary delivered every Monday
5. **Custom categories** -- user-defined transaction categories beyond the default set

## Payment Processing

### Supported Providers
- **YooMoney** (primary) -- most popular among Gen Z in Russia
- **CloudPayments** (secondary) -- card-based recurring payments
- **SBP (Sistema Bystrykh Platezhey)** -- QR-code bank transfers

### Payment Flow
1. User selects plan (monthly/annual) on the upgrade page
2. API creates a payment session with the chosen provider
3. User is redirected to the provider's checkout page
4. On success, provider sends a webhook to `POST /api/subscription/webhook`
5. Backend verifies webhook signature and activates Pro plan
6. User is redirected back to the app with Pro status active

### Webhook Confirmation
- Each provider signs webhook payloads with HMAC-SHA256
- Backend verifies signature before processing any state change
- Duplicate webhook deliveries are idempotent (keyed by payment session ID)

## Plan Management

- **Upgrade**: free -> pro, immediate activation upon payment confirmation
- **Downgrade**: pro -> free, user retains Pro until current billing period ends
- **Cancel**: stops auto-renewal, Pro remains active until `proExpiresAt`
- **Grace period**: 3 calendar days after `proExpiresAt` before features are revoked
- **Reactivate**: user can re-subscribe at any time during or after grace period

## Data Model Changes

The existing `users` table already has `plan` (free/pro) and `proExpiresAt` columns.
A new `subscriptions` log table tracks payment history for auditing.

## Success Metrics

- Conversion rate: free -> pro >= 3% within 90 days of launch
- Churn rate: monthly < 8%
- Payment success rate: > 95% on first attempt
- Webhook processing latency: < 2 seconds p99

## Out of Scope (v1)

- Family/team plans
- Lifetime subscription option
- Crypto payment methods
- Promo codes and discounts (planned for v1.1)
