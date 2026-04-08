# [INS-003] tsx in Docker: use `npx tsx` not `--loader` or `--import`, remove .js extensions

**Date:** 2026-04-08
**Status:** Active
**Severity:** Medium
**Tags:** `docker`, `tsx`, `typescript`, `imports`, `node`
**Hits:** 1

## Error Signatures
```
tsx must be loaded with --import instead of --loader
Cannot find module './routes/auth.js'
Cannot find module './routes/auth'
ERR_MODULE_NOT_FOUND
```

## Symptoms
API and Worker containers crash-loop with MODULE_NOT_FOUND errors when using `node --loader tsx/esm` or `node --import tsx/esm` as Docker CMD.

## Diagnostic Steps
1. First tried `node --loader tsx/esm src/index.ts` — error: "tsx must be loaded with --import"
2. Changed to `node --import tsx/esm src/index.ts` — error: "Cannot find module './routes/auth'"
3. Removed .js extensions from imports — still "Cannot find module './routes/auth'"
4. Changed to `npx tsx src/index.ts` — WORKS

## Root Cause
`tsx` with Node's `--import` flag doesn't properly resolve TypeScript module paths in all cases. The `npx tsx` command uses its own module resolution that handles both extensionless imports and TypeScript files correctly.

## Solution
In Dockerfile CMD, use `npx tsx` directly:
```dockerfile
CMD ["npx", "tsx", "src/index.ts"]
```

In docker-compose.yml worker override:
```yaml
command: ["npx", "tsx", "src/worker.ts"]
```

Also: ALWAYS use extensionless imports (no .js suffix) per INS-002.

## Prevention
- Default to `npx tsx` for running TypeScript in Docker
- Never use `node --loader` (deprecated in Node 20.6+)
- Never use `node --import tsx/esm` (inconsistent resolution)
- Run `find . -name "*.ts" -exec grep "\.js'" {} +` to catch .js imports

## Related
- [INS-002](INS-002-drizzle-js-extensions.md) — same .js extension issue with Drizzle
