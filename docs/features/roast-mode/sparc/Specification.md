# Specification: AI Roast Mode (US-003)

## User Story

**US-003:** As a user who has completed spending analysis, I want to receive a personalized, humorous commentary about my spending habits in Russian, so that I get entertained while gaining financial awareness.

**Story Points:** 8
**Priority:** P0 (Core differentiator)
**Dependencies:** US-002 (AI Analysis)

## Acceptance Criteria (Gherkin)

### Scenario 1: Successful roast generation

```gherkin
Feature: AI Roast Mode

  Scenario: User receives personalized roast after analysis
    Given the user has completed spending analysis
    And the analysis contains categorized transactions
    When the user views analysis results
    Then a personalized roast in Russian is displayed
    And the roast length is between 100 and 300 characters
    And the roast references at least one spending category
    And the roast style matches the user's preference or default
```

### Scenario 2: Free tier rate limiting

```gherkin
  Scenario: Free user hits daily roast limit
    Given the user is on the Free tier
    And the user has already received 1 roast today
    When the user requests another roast
    Then a paywall screen is shown
    And the paywall displays Pro tier benefits
    And the next free roast availability time is shown (midnight MSK)
```

### Scenario 3: Content guardrail activation

```gherkin
  Scenario: AI generates content that fails guardrail check
    Given the AI has generated a roast response
    When the content guardrail check runs
    And the response contains flagged keywords or patterns
    Then the flagged response is logged for review
    And a pre-approved fallback template is used instead
    And the user receives the fallback without error indication
```

### Scenario 4: Low spender tone adjustment

```gherkin
  Scenario: User with very low spending receives adjusted tone
    Given the user's total monthly spending is below 15000 RUB
    And the spending pattern indicates financial constraint
    When a roast is generated
    Then the tone is adjusted to encouraging rather than mocking
    And no references to "being cheap" or poverty are included
    And the commentary focuses on smart money management
```

### Scenario 5: Style selection

```gherkin
  Scenario Outline: User selects commentary style
    Given the user has completed spending analysis
    When the user selects "<style>" commentary style
    Then the generated commentary matches the "<tone>" tone profile

    Examples:
      | style    | tone                          |
      | roast    | sarcastic, sharp, witty       |
      | hype     | positive, encouraging         |
      | balanced | mixed critique and praise     |
```

## Non-Functional Requirements

- Roast generation latency: < 3 seconds (p95)
- Guardrail check latency: < 200ms
- Rate limit check latency: < 50ms
- Availability: 99.5% (degraded = fallback templates served)

## Data Model

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Reference to user |
| `roastText` | string | Generated commentary |
| `style` | enum | roast / hype / balanced |
| `guardrailPassed` | boolean | Whether original passed checks |
| `createdAt` | datetime | Generation timestamp |
| `roastsToday` | integer | Counter for rate limiting |
| `lastRoastDate` | date | Last roast date for reset logic |
