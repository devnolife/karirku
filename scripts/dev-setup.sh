#!/usr/bin/env bash
# Karir.ai — one-shot dev setup
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🚀 Karir.ai dev setup"
echo

if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local from .env.example"
  cp .env.example .env.local
  SECRET=$(openssl rand -base64 32)
  # macOS vs GNU sed
  if sed --version >/dev/null 2>&1; then
    sed -i "s|NEXTAUTH_SECRET=\"change-me-in-production\"|NEXTAUTH_SECRET=\"$SECRET\"|" .env.local
  else
    sed -i "" "s|NEXTAUTH_SECRET=\"change-me-in-production\"|NEXTAUTH_SECRET=\"$SECRET\"|" .env.local
  fi
fi

echo "🐳 Starting docker services..."
docker compose up -d

echo "⏳ Waiting for Postgres..."
for i in {1..30}; do
  if docker exec karirku-postgres pg_isready -U karirku -d karirku >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "📦 Installing dependencies..."
pnpm install

echo "🔧 Running Prisma migrations..."
pnpm prisma migrate deploy || pnpm prisma migrate dev --name init

echo "🌱 Seeding skill taxonomy..."
pnpm db:seed

echo "🤖 Pulling Ollama models (ini bisa ~5 menit pertama kali)..."
./scripts/pull-models.sh

echo
echo "✅ Setup selesai!"
echo "   pnpm dev      → jalankan Next.js"
echo "   pnpm worker   → jalankan BullMQ workers (terminal terpisah)"
echo "   pnpm ai:smoke → test koneksi AI"
