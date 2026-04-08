---
description: Capture a development insight or manage existing insights.
  Creates structured entry in myinsights/ folder with auto-indexing.
  $ARGUMENTS: brief title OR subcommand (archive INS-NNN, status INS-NNN [active|workaround|obsolete])
---

# /myinsights $ARGUMENTS

## What You Do

Manage the project's living knowledge base in `myinsights/` folder.
Each insight is stored as an individual file for precise context loading.

## Subcommands

- `/myinsights [title]` — capture a new insight (default)
- `/myinsights archive INS-NNN` — move insight to archive (obsolete)
- `/myinsights status INS-NNN [active|workaround|obsolete]` — change insight status
- `/myinsights list` — show all insights from index
- `/myinsights search [query]` — search insights by keyword

## Capture Flow (default)

### Step 0. Duplicate Detection

**BEFORE creating a new insight**, search the index for duplicates:

1. Read `myinsights/1nsights.md`
2. Search the `Error Signatures` column for matching error strings
3. Search the `Summary` column for semantically similar descriptions

**If potential duplicate found:**
```
⚠️ Possible duplicate of [INS-NNN] Title
   File: myinsights/INS-NNN-slug.md
   
   Options:
   1. View existing insight and update it with new info
   2. Create new insight anyway (different root cause)
   3. Cancel
```

### Step 1. Collect Information

Ask the user (or reconstruct from conversation context):

- **Title:** One-line summary
- **Error Signatures:** Exact error strings that can be grepped
- **Symptoms:** What went wrong?
- **Diagnostic Steps:** What was checked?
- **Root Cause:** What was the actual problem?
- **Solution:** Step-by-step fix
- **Prevention:** How to avoid in future?
- **Tags:** Categories (e.g., `docker`, `auth`, `csv`, `ai`, `config`)
- **Related:** Links to other insights (e.g., `INS-003`)

### Step 2. Create Individual Detail File

**File naming:** `myinsights/INS-NNN-slug.md`

```markdown
# [INS-NNN] Title

**Date:** YYYY-MM-DD
**Status:** 🟢 Active | 🟡 Workaround | 🔴 Obsolete
**Severity:** 🔴 Critical / 🟡 Medium / 🟢 Low
**Tags:** `tag1`, `tag2`, `tag3`
**Hits:** 0

## Error Signatures
\```
EXACT_ERROR_STRING_1
EXACT_ERROR_STRING_2
\```

## Symptoms
[What went wrong]

## Diagnostic Steps
1. [What was checked first]
2. [What was tried]

## Root Cause
[The actual problem]

## Solution
1. [Step-by-step fix]
2. [Verification]

## Prevention
- [How to avoid this]

## Related
- [Links to other insights or docs]
```

### Step 3. Update Index (`myinsights/1nsights.md`)

If `myinsights/1nsights.md` doesn't exist, create it:

```markdown
# Development Insights Index

Living knowledge base. **Read this file first** — then load specific detail files.

> **For Claude Code:** When you encounter an error, `grep` the Error Signatures column.
> If match found, read ONLY the linked detail file.

| ID | Error Signatures | Summary | Status | Hits | File |
|----|-----------------|---------|--------|------|------|
```

Append new row with insight data.

### Step 4. Auto-numbering

Find highest existing `INS-NNN` number, increment by 1. First entry is `INS-001`.

### Step 5. Notify

```
✅ Insight captured: [INS-NNN] Title
📄 myinsights/INS-NNN-slug.md created
📋 myinsights/1nsights.md index updated
🔄 Will be auto-committed on session end (Stop hook)
```

## Archive Flow (`/myinsights archive INS-NNN`)

1. Move file → `myinsights/archive/INS-NNN-slug.md`
2. Update status in index to `🔴 Obsolete`
3. Notify: `📦 INS-NNN archived`

## Hit Counter

When an insight is used to solve a problem:
1. Increment `**Hits:**` counter in detail file
2. Increment `Hits` column in index
3. Note: `📊 INS-NNN hit count → N`
