FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY turbo.json tsconfig.base.json ./

# Copy workspace package.json files
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/

# Install all dependencies
RUN npm install

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/

# Build Next.js
WORKDIR /app/apps/web
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/apps/web

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/apps/web/next.config.js ./
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npx", "next", "start"]
