#!/bin/sh
set -e

echo "Generating prisma client"
pnpm exec prisma generate

echo "Applying migrations"
pnpm exec prisma migrate deploy

if [ ! -f seed-dist/seed.js ]; then
    echo "seed-dist/seed.js is missing. Incomplete Dockerfile"
fi

echo "Seeding database"
node seed-dist/seed.js

echo "Starting API"
exec node dist/main.js