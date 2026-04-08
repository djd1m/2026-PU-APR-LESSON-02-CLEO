# [INS-002] Drizzle-kit fails with .js import extensions in schema files

**Date:** 2026-04-08
**Status:** Active
**Severity:** Medium
**Tags:** `drizzle`, `typescript`, `imports`, `docker`, `database`
**Hits:** 1

## Error Signatures
```
Cannot find module './users.js'
MODULE_NOT_FOUND
```

## Symptoms
Running `npx drizzle-kit push` fails with:
```
Error: Cannot find module './users.js'
Require stack:
- /packages/db/src/schema/index.ts
- /node_modules/drizzle-kit/bin.cjs
```

## Diagnostic Steps
1. Verified `packages/db/src/schema/users.ts` exists (it does)
2. Checked import in `index.ts` — used `from './users.js'` (ESM-style .js extension)
3. Realized drizzle-kit uses CJS resolver internally which doesn't resolve `.js` → `.ts`

## Root Cause
Agent-generated code used ESM-style imports with `.js` extensions (`from './users.js'`). This is correct for runtime ESM but drizzle-kit's internal bundler (esbuild via CJS) cannot resolve `.js` extensions to `.ts` source files.

## Solution
Remove `.js` extensions from all imports in `packages/db/src/`:
```bash
find packages/db/src -name "*.ts" -exec sed -i "s/from '\.\(\/[^']*\)\.js'/from '.\1'/g" {} +
```

Changed:
- `from './users.js'` → `from './users'`
- `from './uploads.js'` → `from './uploads'`
- etc.

After fix, `npx drizzle-kit push` succeeds.

## Prevention
- When generating TypeScript code for drizzle-orm projects, use extensionless imports
- Add to coding-style rule: "Use extensionless imports in packages/db/ for drizzle-kit compatibility"
- Consider adding ESLint rule: `import/extensions: ["error", "never"]`

## Related
- `packages/db/src/schema/index.ts` — fixed file
- `packages/db/drizzle.config.ts` — config that triggers the resolver
