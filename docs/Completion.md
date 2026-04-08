# Completion: cleo-rf

**Date:** 2026-04-08

---

## Deployment Plan

### Pre-Deployment Checklist

- [ ] All tests passing (unit + integration + E2E)
- [ ] Security audit: input validation, auth, rate limiting
- [ ] Environment variables configured on VPS
- [ ] SSL certificate issued (Let's Encrypt via Certbot)
- [ ] Database migrations applied
- [ ] Backup script tested
- [ ] Monitoring endpoints configured
- [ ] Privacy policy page published
- [ ] Test CSV upload on production (dry run)

### Deployment Sequence

```bash
# 1. Prepare VPS
ssh deploy@vps "mkdir -p /app/cleo-rf && cd /app/cleo-rf"

# 2. Clone and configure
git clone <repo> /app/cleo-rf
cp .env.production /app/cleo-rf/.env

# 3. Build and start
cd /app/cleo-rf
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 4. Run migrations
docker compose exec api npx drizzle-kit migrate

# 5. Seed test data (optional)
docker compose exec api npx ts-node packages/db/seed/index.ts

# 6. Verify health
curl https://cleorf.app/api/health
curl https://cleorf.app
```

### Rollback Procedure

```bash
# 1. Stop current containers
docker compose -f docker-compose.prod.yml down

# 2. Revert to previous version
git checkout <previous-tag>
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 3. Rollback database (if needed)
docker compose exec api npx drizzle-kit rollback

# 4. Verify
curl https://cleorf.app/api/health
```

## CI/CD Configuration

### GitHub Actions

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: cleorf_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:integration

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /app/cleo-rf
            git pull origin main
            docker compose -f docker-compose.prod.yml build
            docker compose -f docker-compose.prod.yml up -d
            docker compose exec -T api npx drizzle-kit migrate
```

## Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/certs:/etc/letsencrypt
    depends_on:
      - web
      - api

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    environment:
      - NEXT_PUBLIC_API_URL=https://cleorf.app/api
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    environment:
      - DATABASE_URL=postgresql://cleorf:${DB_PASSWORD}@postgres:5432/cleorf
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - AI_BASE_URL=${AI_BASE_URL}
      - AI_API_KEY=${AI_API_KEY}
      - AI_MODEL_ID=${AI_MODEL_ID}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      - DATABASE_URL=postgresql://cleorf:${DB_PASSWORD}@postgres:5432/cleorf
      - REDIS_URL=redis://redis:6379
      - AI_BASE_URL=${AI_BASE_URL}
      - AI_API_KEY=${AI_API_KEY}
      - AI_MODEL_ID=${AI_MODEL_ID}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cleorf
      POSTGRES_USER: cleorf
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cleorf"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  pgdata:
  redis-data:
```

## Monitoring & Alerting

### Key Metrics

| Metric | Threshold | Alert Channel |
|--------|-----------|--------------|
| API response time p99 | > 500ms | Telegram bot |
| AI worker queue length | > 50 jobs | Telegram bot |
| Error rate (5xx) | > 1% | Telegram bot |
| CPU usage | > 80% for 5 min | Email |
| Disk usage | > 85% | Email |
| PostgreSQL connections | > 80% of max | Telegram bot |
| Daily CSV uploads | < previous day × 0.5 | Email (anomaly) |
| AI API cost | > daily budget | Telegram bot |

### Health Endpoints

```
GET /api/health → { "status": "ok", "db": "connected", "redis": "connected", "version": "0.1.0" }
GET /api/health/detailed → { ...above, "queue_length": 3, "uptime": "48h", "memory_mb": 256 }
```

### Logging Strategy

```
Level: INFO (production), DEBUG (staging)
Format: JSON structured logs
Fields: timestamp, level, service, request_id, user_id, message, duration_ms
Retention: 30 days
Aggregation: stdout → Docker logs → log rotation (logrotate)
```

## Backup Strategy

```bash
# Daily automated backup (cron at 3:00 AM)
0 3 * * * docker compose exec -T postgres pg_dump -U cleorf cleorf | gzip > /backups/cleorf-$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "cleorf-*.sql.gz" -mtime +30 -delete

# Weekly offsite copy (to S3-compatible storage)
0 4 * * 0 aws s3 cp /backups/cleorf-$(date +\%Y\%m\%d).sql.gz s3://cleorf-backups/
```

## Handoff Checklist

### For Development Team
- [ ] Repo access + branching strategy (main + feature branches)
- [ ] Local dev setup: `docker compose up` + `.env.example`
- [ ] Code review process: PR required, 1 approval
- [ ] Test data: `test-data/` directory with 5 CSV scenarios

### For QA Team
- [ ] Staging environment URL
- [ ] Test accounts (free + pro)
- [ ] Test CSV files with expected results
- [ ] Bug reporting: GitHub Issues with template

### For Operations
- [ ] VPS access (SSH key)
- [ ] Docker Compose commands cheat sheet
- [ ] Backup verification procedure
- [ ] Incident response: check logs → restart containers → rollback
