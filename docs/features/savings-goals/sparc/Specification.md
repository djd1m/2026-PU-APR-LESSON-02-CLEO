# Savings Goals — Specification

## User Stories

### US-1: Create a Savings Goal
**As a** registered user,
**I want to** create a savings goal with a name, target amount, and optional deadline,
**So that** I can track my progress toward a specific financial target.

**Acceptance Criteria:**
- Name is required, 1-200 characters
- Target amount is required, positive number in RUB (max 999,999,999.99)
- Deadline is optional, must be a future date if provided
- Goal is associated with the authenticated user
- Response includes the created goal with id and timestamps

### US-2: View Goals with Progress
**As a** registered user,
**I want to** see all my savings goals with visual progress bars,
**So that** I can understand how close I am to each target.

**Acceptance Criteria:**
- Goals are listed with name, current amount, target amount, and percentage
- Progress bar is color-coded: red (< 30%), yellow (30-70%), green (> 70%)
- Days remaining shown if deadline is set
- Empty state displayed when no goals exist

### US-3: Update a Savings Goal
**As a** registered user,
**I want to** edit my goal's name, target amount, current amount, or deadline,
**So that** I can adjust my targets as circumstances change.

**Acceptance Criteria:**
- Only the goal owner can edit
- All fields are optional in the update payload
- Validation rules match creation rules
- Returns updated goal

### US-4: Delete a Savings Goal
**As a** registered user,
**I want to** delete a goal I no longer need,
**So that** my goals list stays relevant.

**Acceptance Criteria:**
- Only the goal owner can delete
- Returns 204 on success
- Goal is permanently removed

### US-5: AI References Goals in Roasts
**As a** registered user with savings goals,
**I want** the AI roast to mention my goals when relevant,
**So that** the analysis feels personalized and motivating.

**Acceptance Criteria:**
- AI prompt includes active goals as context
- Roast may reference goal name and remaining amount
- Feature degrades gracefully if no goals exist

---

## BDD Scenarios (Gherkin)

### Feature: Savings Goal CRUD

```gherkin
Feature: Savings Goal Management

  Background:
    Given the user is authenticated

  Scenario: Create a savings goal with all fields
    When the user sends POST /api/goals with:
      | name         | targetAmount | deadline   |
      | Vacation     | 50000        | 2026-12-31 |
    Then the response status is 201
    And the response contains a goal with name "Vacation"
    And the goal has targetAmount "50000"
    And the goal has currentAmount "0"
    And the goal has a valid UUID id

  Scenario: Create a savings goal without deadline
    When the user sends POST /api/goals with:
      | name         | targetAmount |
      | Emergency    | 100000       |
    Then the response status is 201
    And the goal deadline is null

  Scenario: Reject goal creation with missing name
    When the user sends POST /api/goals with:
      | targetAmount |
      | 50000        |
    Then the response status is 400
    And the error code is "VALIDATION_ERROR"

  Scenario: Reject goal creation with negative amount
    When the user sends POST /api/goals with:
      | name  | targetAmount |
      | Test  | -500         |
    Then the response status is 400

  Scenario: List user goals
    Given the user has 3 savings goals
    When the user sends GET /api/goals
    Then the response status is 200
    And the response contains 3 goals
    And each goal includes a "progress" percentage field

  Scenario: Update a savings goal
    Given the user has a goal "Vacation" with targetAmount 50000
    When the user sends PATCH /api/goals/:id with:
      | currentAmount |
      | 15000         |
    Then the response status is 200
    And the goal currentAmount is "15000"

  Scenario: Prevent editing another user's goal
    Given another user has a goal "Their Goal"
    When the user sends PATCH /api/goals/:otherId with:
      | name |
      | Stolen |
    Then the response status is 404

  Scenario: Delete a savings goal
    Given the user has a goal "Old Goal"
    When the user sends DELETE /api/goals/:id
    Then the response status is 204
    And the goal no longer exists

  Scenario: Empty state
    Given the user has no savings goals
    When the user visits the goals page
    Then the page displays "Set your first savings goal!"
```

### Feature: Goal Progress Visualization

```gherkin
Feature: Goal Progress Visualization

  Scenario Outline: Progress bar color coding
    Given a goal with currentAmount <current> and targetAmount <target>
    Then the progress bar color is <color>

    Examples:
      | current | target | color  |
      | 5000    | 50000  | red    |
      | 20000   | 50000  | yellow |
      | 40000   | 50000  | green  |
      | 50000   | 50000  | green  |

  Scenario: Celebration on goal completion
    Given a goal with currentAmount 50000 and targetAmount 50000
    Then the progress shows 100%
    And a celebration animation is displayed

  Scenario: Days remaining display
    Given a goal with deadline "2026-12-31"
    And today is "2026-04-08"
    Then the goal shows "267 days remaining"
```
