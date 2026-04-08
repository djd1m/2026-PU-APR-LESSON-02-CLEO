# Specification: Savings Recommendations

## User Story US-008

As a user, I want actionable tips to reduce spending, so that I can save more money.

## Acceptance Criteria

### Scenario: Personalized recommendations
```gherkin
Given my analysis shows high food delivery spending
When I view recommendations
Then I see 3-5 specific recommendations
And at least one references my food delivery category
And each includes an estimated monthly savings amount in RUB
And none are generic ("тратьте меньше")
```

### Scenario: Subscription consolidation
```gherkin
Given my analysis found Spotify (299 RUB) and VK Музыка (169 RUB)
When I view recommendations
Then one recommends canceling the duplicate music service
And shows savings of 169 RUB/month (or 299 RUB/month)
```

### Scenario: Frugal user
```gherkin
Given my total expenses are under 15,000 RUB/month
When recommendations are generated
Then the AI acknowledges good habits
And suggests optimization rather than cuts
And does not shame the user for low spending
```

## Data Model
```typescript
interface Recommendation {
  text: string;        // Actionable recommendation in Russian
  savingsRub: number;  // Estimated monthly savings
  category: string;    // Referenced spending category
}
```
