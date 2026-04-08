# Coding Style: cleo-rf

## Language & Framework
- TypeScript strict mode everywhere
- Next.js 15 App Router for frontend
- Express.js for API
- Drizzle ORM for database
- BullMQ for job queues

## TypeScript
- No `any` types — use proper typing from `packages/shared`
- Use `unknown` + type guards for external data
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use `as const` for literal types

## Naming
- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database columns: `snake_case`
- API endpoints: `kebab-case`

## Architecture
- Shared types ONLY in `packages/shared`
- Database access ONLY through `packages/db`
- Business logic in `apps/api/src/services/`
- Route handlers thin — delegate to services
- AI prompts in dedicated `prompts/` directory

## Error Handling
- Use custom error classes extending base Error
- Centralized error handler middleware in API
- Never swallow errors silently
- Log errors with context (request_id, user_id)

## Testing
- Framework: Vitest
- Test files: `*.test.ts` alongside source
- Minimum coverage target: 80% for business logic
- Test CSV parser with all 5 test scenarios from `test-data/`
