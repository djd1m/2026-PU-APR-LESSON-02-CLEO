# Savings Goals — Product Requirements Document

## Overview

The Savings Goals feature allows cleo-rf users to set named financial targets (e.g., "Vacation 50,000 RUB"), track progress toward each goal, and receive AI-powered motivation tied to their spending behavior. Goals bridge the gap between passive expense tracking and active behavior change.

## Problem Statement

Users upload bank statements and receive roast-style spending analyses, but they lack a forward-looking mechanism to channel insights into action. Without concrete targets, even the best roast fades from memory within hours.

## Target Users

- Existing cleo-rf users who already upload bank statements
- Users aged 18-35 who respond to gamified progress visualization
- Users who want to save for specific purchases or experiences

## Goals & Success Metrics

| Metric | Target |
|--------|--------|
| Goal creation rate | 40% of active users create at least one goal within 2 weeks |
| Return engagement | Users with goals return 2x more often than users without |
| Goal completion rate | 20% of goals marked complete within their deadline |

## Core Capabilities

### 1. Goal Creation
Users can create a savings goal with:
- **Name** (required) — descriptive label, e.g., "New iPhone", "Emergency Fund"
- **Target amount** (required) — in RUB, e.g., 50,000
- **Deadline** (optional) — target date for achieving the goal

### 2. Progress Visualization
The goals dashboard displays:
- List of all active goals
- Per-goal progress bar showing saved/target percentage
- Color-coded progress (red < 30%, yellow 30-70%, green > 70%)
- Days remaining until deadline (if set)
- Celebration animation when a goal reaches 100%

### 3. Goal Management
- Edit goal name, target amount, current amount, and deadline
- Delete goals that are no longer relevant
- Goals persist across sessions

### 4. AI Integration
AI roast messages reference user goals when relevant:
- "Still 30K away from your vacation — maybe skip the third latte this week?"
- Goals provide context for personalized recommendations

## Architecture Fit

- **Backend**: New `savings_goals` table in PostgreSQL via Drizzle ORM
- **API**: CRUD endpoints at `/api/goals` on the Express API
- **Frontend**: New `/goals` page in the Next.js app with progress bar component
- **Auth**: All endpoints protected by existing JWT auth middleware

## Out of Scope (v1)

- Automatic savings transfers
- Goal sharing / social features
- Multiple currency support
- Goal categories or templates
- Linking specific transactions to goals
