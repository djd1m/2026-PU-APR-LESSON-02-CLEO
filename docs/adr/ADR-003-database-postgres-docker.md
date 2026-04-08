# ADR-003: Database — PostgreSQL in Docker (not Supabase)

**Status:** Accepted
**Date:** 2026-04-08
**Decision Makers:** Product Owner

## Context

Original Cleo uses PostgreSQL (confirmed via StackShare). The user explicitly requested PostgreSQL in Docker instead of Supabase.

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **PostgreSQL in Docker** | Full control, no vendor lock-in, free, matches Cleo's tech | Need to manage backups, migrations, monitoring |
| Supabase (hosted) | Instant setup, realtime, auth, storage included | Vendor lock-in, pricing at scale, US-hosted (latency for RU) |
| Supabase (self-hosted) | Open source, feature-rich | Complex to self-host, heavy resource footprint |
| MySQL/MariaDB | Widely available | Weaker JSON support, less extension ecosystem |
| MongoDB | Flexible schema | Not ideal for financial data (ACID compliance) |

## Decision

**PostgreSQL 16+ in Docker container** with:
- Volume mount for data persistence
- pg_dump cron for backups
- Prisma or Drizzle ORM for type-safe queries
- pgvector extension ready (for AI embeddings in v2)

## Docker Compose snippet

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cleorf
      POSTGRES_USER: cleorf
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cleorf"]
      interval: 5s
```

## Consequences

- Team responsible for backup strategy (automated pg_dump + offsite copy)
- Migrations managed via ORM (Prisma migrate or Drizzle push)
- Connection pooling needed at scale (PgBouncer in separate container)
- pgvector available for future AI features (semantic search on transactions)
