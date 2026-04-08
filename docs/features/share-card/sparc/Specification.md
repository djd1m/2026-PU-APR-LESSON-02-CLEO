# Specification: Share Card Generation

## User Story US-005

As a user, I want to share my roast on social media, so that my friends see it and try the app.

## Acceptance Criteria

### Scenario: Generate share card
```gherkin
Given I have a completed analysis with a roast
When I click "Поделиться"
Then a share card image is generated within 3 seconds
And the card displays roast text (visible)
And category names are visible
And financial amounts are blurred or replaced with emoji bars
And cleo-rf branding is visible
And a referral link is included
```

### Scenario: Share to platforms
```gherkin
Given a share card has been generated
When I click a share button
Then I can share to VK, Telegram, or copy the link
And the referral link tracks the source user
```

### Scenario: Privacy protection
```gherkin
Given I generate a share card
When I inspect the generated image
Then no actual RUB amounts appear
And no transaction descriptions appear
```

### Scenario: Non-guessable referral codes
```gherkin
Given user A has referral code "ABCDEF"
When an attacker tries sequential codes
Then invalid codes return a generic landing page
And no error message reveals valid code patterns
```
