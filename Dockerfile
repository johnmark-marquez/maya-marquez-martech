FROM node:22-alpine AS base
WORKDIR /app
ENV CI=true

RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build
RUN pnpm run seed:build


FROM base AS runner
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY docker-entrypoint.sh ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/seed-dist ./seed-dist

RUN chmod +x docker-entrypoint.sh \
    && pnpm prune --prod \
    && pnpm exec prisma generate
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]