set -e
pnpm exec prisma migrate deploy
exec node dist/main.js