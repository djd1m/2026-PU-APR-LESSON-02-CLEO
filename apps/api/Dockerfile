FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY turbo.json tsconfig.base.json ./

# Copy workspace package.json files
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/

# Install all dependencies
RUN npm install

# Copy source code
COPY packages/ packages/
COPY apps/api/ apps/api/

# Build API
WORKDIR /app/apps/api
RUN npx tsc || true

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["npx", "tsx", "src/index.ts"]
