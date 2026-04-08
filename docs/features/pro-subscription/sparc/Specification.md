# Specification: Pro Subscription

## User Stories

### US-1: Upgrade to Pro
**As a** free user,
**I want to** upgrade to a Pro subscription,
**So that** I get unlimited roasts and advanced financial insights.

### US-2: Cancel Subscription
**As a** Pro user,
**I want to** cancel my subscription renewal,
**So that** I stop being charged while keeping Pro until the billing period ends.

### US-3: Check Pro Status
**As a** user,
**I want to** see my current plan status and expiration date,
**So that** I know when my Pro benefits expire.

### US-4: Grace Period Access
**As a** recently-expired Pro user,
**I want to** retain Pro features for 3 days after expiry,
**So that** I have time to renew without losing access abruptly.

## Acceptance Criteria (Gherkin)

### Feature: Pro Subscription Upgrade

```gherkin
Feature: Pro subscription upgrade

  Scenario: Successful payment activates Pro plan
    Given I am a free user
    When I select the monthly Pro plan at 499 RUB
    And I complete payment via YooMoney
    Then my plan is updated to "pro"
    And my proExpiresAt is set to 30 days from now
    And the daily roast limit is removed

  Scenario: Annual plan gives 12 months
    Given I am a free user
    When I select the annual Pro plan at 3999 RUB
    And I complete payment
    Then my proExpiresAt is set to 365 days from now

  Scenario: Failed payment does not change plan
    Given I am a free user
    When the payment fails or is cancelled
    Then my plan remains "free"
    And no charges are applied
```

### Feature: Subscription Cancellation

```gherkin
Feature: Subscription cancellation

  Scenario: Cancel keeps Pro until end of period
    Given I am a Pro user with proExpiresAt in 15 days
    When I cancel my subscription
    Then auto-renewal is disabled
    And my plan remains "pro" until proExpiresAt

  Scenario: After expiry with grace period
    Given I am a Pro user whose proExpiresAt was 2 days ago
    When I access a Pro feature
    Then I still have access because grace period is 3 days

  Scenario: After grace period expires
    Given I am a Pro user whose proExpiresAt was 4 days ago
    When I access a Pro feature
    Then I am downgraded to free
    And I see an "Upgrade to Pro" prompt
```

### Feature: Webhook Security

```gherkin
Feature: Webhook signature verification

  Scenario: Valid webhook signature
    Given the payment provider sends a webhook
    And the HMAC-SHA256 signature matches
    When the webhook is processed
    Then the user's plan is updated

  Scenario: Invalid webhook signature
    Given an attacker sends a forged webhook
    And the HMAC-SHA256 signature does not match
    When the webhook is received
    Then it is rejected with HTTP 403
    And no plan changes occur

  Scenario: Duplicate webhook is idempotent
    Given a webhook for session "sess_123" was already processed
    When the same webhook is received again
    Then no duplicate plan change occurs
    And the response is HTTP 200
```

## Non-Functional Requirements

- Webhook processing must complete within 2 seconds
- Payment session creation must respond within 1 second
- All payment data is transmitted over HTTPS only
- Webhook secrets are stored in environment variables, never in code
- Failed webhooks are logged with full payload for debugging

## Security Requirements

- Webhook signature verification is mandatory before any state mutation
- Payment sessions expire after 30 minutes
- Rate limiting: max 5 checkout requests per user per hour
- No credit card data is stored on our servers (handled by payment provider)
- Subscription status changes are logged in an audit trail
