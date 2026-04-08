---
description: Guide deployment to specified environment.
  Runs pre-deployment checks, deploys via Docker Compose, verifies health.
  $ARGUMENTS: "staging" | "production" (default: staging)
---

# /deploy $ARGUMENTS

## Purpose

Guided deployment with pre-flight checks, execution, and verification.

## Step 1: Pre-Deployment Checklist

Read `docs/Completion.md` and verify:

- [ ] All tests passing (`npx turbo test`)
- [ ] No uncommitted changes (`git status`)
- [ ] Environment variables configured (`.env` exists on target)
- [ ] Docker images build successfully (`docker compose build`)
- [ ] Database migrations ready

## Step 2: Deploy

### Staging (default)
```bash
docker compose -f docker-compose.yml up -d --build
npx drizzle-kit push
curl http://localhost:4000/api/health
```

### Production
```bash
# Requires explicit confirmation
ssh deploy@$VPS_HOST "cd /app/cleo-rf && git pull && docker compose -f docker-compose.prod.yml up -d --build"
ssh deploy@$VPS_HOST "cd /app/cleo-rf && docker compose exec -T api npx drizzle-kit push"
curl https://cleorf.app/api/health
```

## Step 3: Verify

1. Health endpoint returns 200
2. Key features working (upload, analysis)
3. No error spikes in logs

## Step 4: Report

```
✅ Deployed to <environment>
   Version: <git tag or commit>
   Services: web, api, worker, postgres, redis
   Health: OK
   URL: <url>
```
