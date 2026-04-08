# Savings Goals — Pseudocode

## Data Model

```
TYPE SavingsGoal:
  id:            UUID (auto-generated, primary key)
  userId:        UUID (foreign key -> users.id, cascade delete)
  name:          VARCHAR(200), NOT NULL
  targetAmount:  NUMERIC(12,2), NOT NULL
  currentAmount: NUMERIC(12,2), NOT NULL, DEFAULT 0
  deadline:      DATE, NULLABLE
  createdAt:     TIMESTAMP, DEFAULT NOW(), NOT NULL
```

## API Endpoints

### GET /api/goals
```
FUNCTION listGoals(req):
  userId = req.userId  // from auth middleware
  goals = SELECT * FROM savings_goals WHERE userId = userId ORDER BY createdAt DESC
  
  FOR EACH goal IN goals:
    goal.progress = calculateProgress(goal.currentAmount, goal.targetAmount)
    IF goal.deadline:
      goal.daysRemaining = daysBetween(TODAY, goal.deadline)
  
  RETURN { data: goals }
```

### POST /api/goals
```
FUNCTION createGoal(req):
  userId = req.userId
  { name, targetAmount, deadline } = validate(req.body, CreateGoalSchema)
  
  // CreateGoalSchema:
  //   name: string, min 1, max 200
  //   targetAmount: number, positive, max 999999999.99
  //   deadline: date string (optional), must be future if provided
  
  goal = INSERT INTO savings_goals (userId, name, targetAmount, deadline)
         VALUES (userId, name, targetAmount, deadline)
         RETURNING *
  
  goal.progress = 0
  RETURN { data: goal }, status 201
```

### PATCH /api/goals/:id
```
FUNCTION updateGoal(req):
  userId = req.userId
  goalId = req.params.id
  updates = validate(req.body, UpdateGoalSchema)
  
  // UpdateGoalSchema:
  //   name: string (optional), min 1, max 200
  //   targetAmount: number (optional), positive
  //   currentAmount: number (optional), non-negative
  //   deadline: date string or null (optional)
  
  existing = SELECT * FROM savings_goals WHERE id = goalId AND userId = userId
  IF NOT existing:
    THROW 404 "GOAL_NOT_FOUND"
  
  updated = UPDATE savings_goals SET ...updates WHERE id = goalId RETURNING *
  updated.progress = calculateProgress(updated.currentAmount, updated.targetAmount)
  
  RETURN { data: updated }
```

### DELETE /api/goals/:id
```
FUNCTION deleteGoal(req):
  userId = req.userId
  goalId = req.params.id
  
  existing = SELECT * FROM savings_goals WHERE id = goalId AND userId = userId
  IF NOT existing:
    THROW 404 "GOAL_NOT_FOUND"
  
  DELETE FROM savings_goals WHERE id = goalId
  RETURN status 204
```

## Algorithm: calculateProgress

```
FUNCTION calculateProgress(currentAmount, targetAmount):
  IF targetAmount <= 0:
    RETURN 0
  
  percentage = (currentAmount / targetAmount) * 100
  RETURN MIN(percentage, 100)  // cap at 100%
```

## Algorithm: getProgressColor

```
FUNCTION getProgressColor(percentage):
  IF percentage < 30:
    RETURN "red"    // bg-gradient from rose-500 to red-500
  ELSE IF percentage < 70:
    RETURN "yellow" // bg-gradient from amber-400 to yellow-500
  ELSE:
    RETURN "green"  // bg-gradient from emerald-400 to green-500
```

## Frontend Flow

```
PAGE GoalsPage:
  ON MOUNT:
    IF NOT authenticated: REDIRECT to /login
    goals = FETCH GET /api/goals
  
  RENDER:
    Header with navigation
    "Add Goal" form (name, targetAmount, deadline)
    
    IF goals.length == 0:
      SHOW empty state: "Set your first savings goal!"
    ELSE:
      FOR EACH goal IN goals:
        GoalProgressBar(goal)
        Delete button

COMPONENT GoalProgressBar(goal):
  percentage = goal.progress
  color = getProgressColor(percentage)
  
  RENDER:
    Goal name
    Progress bar with gradient fill at {percentage}% width
    "{currentAmount} / {targetAmount} RUB" label
    IF goal.deadline:
      "{daysRemaining} days remaining"
    IF percentage >= 100:
      Celebration animation (confetti / sparkle)
```
