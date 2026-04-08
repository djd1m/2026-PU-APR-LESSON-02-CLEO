# ADR-007: Regulatory Status — Information Service (No CB License)

**Status:** Accepted
**Date:** 2026-04-08
**Decision Makers:** Product Owner

## Context

Financial services in Russia require licensing from the Central Bank (CB RF). We need to determine whether cleo-rf requires any licenses.

## Options Considered

| Option | License Required | Pros | Cons |
|--------|:----------------:|------|------|
| **Information service** | No | Fast launch, no regulatory overhead | Cannot offer cash advance, auto-savings |
| Financial advisor | Yes (Investment Advisory) | Can give personalized advice | Heavy regulation, compliance costs |
| Payment service | Yes (NPS license) | Can process payments | Extremely complex, capital requirements |
| Banking agent | Yes (partnership agreement) | Can offer bank products | Dependency on bank partner |

## Decision

**Information service** — cleo-rf provides informational analysis only:

### What we CAN do:
- Analyze uploaded CSV data
- Show spending categories and patterns
- Generate humorous commentary (roasts)
- Suggest general savings strategies
- Track subscriptions from uploaded data
- Show charts and reports

### What we CANNOT do (without license):
- Automatically move money between accounts
- Offer cash advances or loans
- Provide personalized investment advice
- Execute transactions on behalf of user
- Store or process payment credentials

### Disclaimers (mandatory):
```
"cleo-rf предоставляет информационно-аналитические услуги. 
Не является финансовой консультацией. 
Не является кредитной организацией."
```

## Consequences

- No cash advance feature in MVP (Cleo's 2nd revenue stream — we skip it)
- All recommendations framed as "informational" not "advisory"
- Legal review recommended before public launch
- Simplifies MVP scope significantly
- Can add licensed features later through bank partnership
