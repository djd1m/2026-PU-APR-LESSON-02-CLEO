---
description: Show next features to work on from the project roadmap.
  Quick overview of sprint progress and top suggested tasks.
  $ARGUMENTS: optional — "update" to refresh statuses, or feature-id to mark as done
---

# /next $ARGUMENTS

## Default: Show Next Steps

1. Read `.claude/feature-roadmap.json`
2. Show current sprint progress (% complete)
3. List top 3 suggested next tasks based on priority and dependencies
4. Show any blocking issues
5. Ask which task to start

Format output:
```
═══════════════════════════════════════════════════════════
📋 Feature Roadmap: cleo-rf
   Sprint: MVP — N/M complete (X%)
═══════════════════════════════════════════════════════════

🔨 In Progress:
   • [Feature Name] — [description]
     Files: [file paths]

⏭️ Next Up:
   • [Feature Name] — [description]
     Depends on: [none | feature-id]

🚫 Blocked:
   • [Feature Name] — waiting on: [dependency]

🕐 Recent Work:
   [git log last 5 commits]
═══════════════════════════════════════════════════════════

Which one shall we tackle? (1/2/3 or describe your own)
```

## /next update

Review the current codebase state and conversation history:
1. Check which features appear to be implemented (scan for key files)
2. Suggest status updates for features that may be done
3. Apply updates after user confirmation

## /next [feature-id]

Mark a specific feature as done:
1. Update status to `"done"` in `.claude/feature-roadmap.json`
2. Check if this unblocks any dependent features → update their status to `"next"`
3. Show updated sprint progress
4. Suggest the next feature to work on

## Priority Rules

- `blocked` items → show but don't suggest (explain what's blocking)
- `in_progress` → suggest continuing (highest priority)
- `next` → suggest starting (second priority)
- `planned` → only suggest if no `next` items remain
- Respect `depends_on` — never suggest a feature whose dependencies aren't `done`
