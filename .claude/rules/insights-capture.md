# Insights Capture Protocol

## Error-First Lookup (CRITICAL — do this BEFORE debugging)

**IMPORTANT:** When you encounter ANY error, ALWAYS do this before starting to debug:

```bash
# Step 1: Check if index exists
if [ -f "myinsights/1nsights.md" ]; then
  # Step 2: Grep for the error signature in the index
  grep -i "ERROR_STRING_OR_CODE" myinsights/1nsights.md
fi
```

**Pattern:**
1. Error occurs
2. Extract key error string
3. Grep against `myinsights/1nsights.md`
4. **If match found** → read linked detail file → suggest documented solution FIRST
5. **If match found AND works** → increment hit counter
6. **If no match** → debug normally → after resolution, suggest `/myinsights`

## When to Suggest Capturing

Proactively suggest `/myinsights` when:

1. **Error → Fix cycle**: Non-trivial bug debugged and resolved
2. **Configuration surprise**: Config setting behaved unexpectedly
3. **Dependency issue**: Library caused problems
4. **Workaround applied**: Temporary fix needs future attention

## When NOT to Suggest

- Trivial typos or syntax errors
- Well-known framework patterns
- Issues already in `myinsights/`
- User explicitly declined

## Lifecycle Awareness

- `Active` — trusted solution, apply directly
- `Workaround` — temporary fix, flag to user
- `Obsolete` — should be archived
