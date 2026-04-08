FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
RUN npm install --workspace=@cleo-rf/api
COPY packages/ packages/
COPY apps/api/ apps/api/
WORKDIR /app/apps/api
RUN npx tsc
EXPOSE 4000
CMD ["node", "dist/index.js"]
