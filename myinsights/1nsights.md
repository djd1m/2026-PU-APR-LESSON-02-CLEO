# Development Insights Index

Living knowledge base. **Read this file first** — then load specific detail files as needed.

> **For Claude Code:** When you encounter an error, `grep` the Error Signatures column below.
> If you find a match, read ONLY the linked detail file — don't load everything.

| ID | Error Signatures | Summary | Status | Hits | File |
|----|-----------------|---------|--------|------|------|
| INS-001 | `feature marked done without /go`, `no per-feature docs`, `docs/features/ empty` | /run mvp skipped /go pipeline — features marked done without SPARC docs | Active | 1 | [INS-001-run-skipped-go-pipeline.md](INS-001-run-skipped-go-pipeline.md) |
| INS-002 | `.js extension`, `Cannot find module`, `MODULE_NOT_FOUND` | Drizzle-kit fails with .js import extensions in schema files | Active | 1 | [INS-002-drizzle-js-extensions.md](INS-002-drizzle-js-extensions.md) |
| INS-003 | `tsx must be loaded with --import`, `ERR_MODULE_NOT_FOUND`, `Cannot find module` | tsx in Docker: use `npx tsx` not `--loader`/`--import`, extensionless imports | Active | 1 | [INS-003-tsx-docker-imports.md](INS-003-tsx-docker-imports.md) |
