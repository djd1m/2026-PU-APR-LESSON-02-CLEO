# Specification: Weekly Spending Report (US-006)

## User Story

**US-006:** As a user, I want to receive a weekly spending summary with a mini-roast so that I stay aware of my financial habits without checking the app manually.

**Story Points:** 5
**Priority:** P1 (Engagement driver)
**Dependencies:** US-002 (AI Analysis), US-003 (Roast Mode)

## Acceptance Criteria (Gherkin)

### Scenario 1: Weekly report delivery

```gherkin
Feature: Weekly Spending Report

  Scenario: Active user receives weekly summary on Monday
    Given the user has uploaded at least one bank statement
    And the user has not opted out of weekly reports
    When Monday 10:00 MSK arrives
    Then the system generates a spending summary for the last 7 days
    And the summary contains the weekly total spent
    And the summary contains the top-3 spending categories
    And the summary contains a mini-roast between 50 and 150 characters
    And the summary contains week-over-week comparison with arrows
```

### Scenario 2: Pro user detailed breakdown

```gherkin
  Scenario: Pro user receives detailed weekly report
    Given the user is on the Pro tier
    And the user has transaction data for the past 7 days
    When the weekly report is generated
    Then the report includes a full category breakdown with amounts
    And the report includes subscription renewal alerts
    And the report includes per-category week-over-week trends
```

### Scenario 3: User opts out

```gherkin
  Scenario: User disables weekly reports
    Given the user has weekly reports enabled (default)
    When the user updates settings to disable weekly reports
    Then the system saves the preference
    And the user does not receive reports on the next Monday
```

### Scenario 4: No transactions in period

```gherkin
  Scenario: User has no transactions in the last 7 days
    Given the user has no transaction data for the past week
    When the weekly report job runs
    Then the system skips this user without error
    And no notification is sent to the user
```

### Scenario 5: Error isolation

```gherkin
  Scenario: One user's report fails without blocking others
    Given user A has corrupted transaction data
    And user B has valid transaction data
    When the weekly report job processes both users
    Then user B receives their report successfully
    And user A's error is logged for investigation
```

## Non-Functional Requirements

- Full batch processing: < 5 minutes for 1000 users
- Per-user report generation: < 3 seconds
- Job must be idempotent (re-run safe)
- Error rate per user: < 1%

## Data Model

| Field | Type | Description |
|-------|------|-------------|
| `weeklyReportEnabled` | boolean | User preference, default true |
| `notificationChannel` | enum | email / push / telegram (MVP: email) |
