# ADR-002: Architecture Pattern — Distributed Monolith

**Status:** Accepted
**Date:** 2026-04-08
**Decision Makers:** Product Owner + AI Architect

## Context

Need to choose an architecture pattern for cleo-rf MVP that balances:
- Speed of development (small team, fast iteration)
- Ability to scale later
- Operational simplicity (VPS deployment)
- Cost efficiency

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Distributed Monolith (Monorepo)** | Single deploy, shared types, easy refactoring, Docker Compose ready | Can become tangled without discipline |
| Classic Monolith | Simplest, fastest to start | Hard to extract services later, no isolation |
| Microservices | Independent scaling, fault isolation | Overkill for MVP, complex ops, expensive |
| Serverless | Zero ops, auto-scaling | Vendor lock-in, cold starts, hard to debug |
| Modular Monolith | Good separation within monolith | Still single deploy, may not fit container model |

## Decision

**Distributed Monolith in Monorepo** — all services in one repo, deployed as separate Docker containers via Docker Compose, but sharing code and types.

Architecture:
```
monorepo/
  apps/
    web/          # Next.js frontend
    api/          # Node.js/Express API
    ai-worker/    # AI analysis service
  packages/
    shared/       # Shared types, utils
    db/           # Prisma/Drizzle schema
  docker-compose.yml
```

## Rationale

- Cleo itself uses a modular monolith (Ruby on Rails) — proven pattern for fintech at this scale
- Docker Compose deploys cleanly to VPS without Kubernetes complexity
- Monorepo enables code sharing (types, validation) between services
- Each service can be independently scaled by adding container replicas
- Migration to microservices is straightforward — services are already containerized

## Consequences

- Need clear module boundaries from day 1
- Shared database is acceptable for MVP, plan for per-service DBs in v2
- CI/CD must build all containers on each push
- Docker Compose limits to single-host deployment (sufficient for MVP scale)
