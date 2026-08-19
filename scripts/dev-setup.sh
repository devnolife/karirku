#!/usr/bin/env bash
# Karir.ai — one-shot dev setup.
#
# Infrastructure (Postgres, Redis, MinIO, Ollama), the Prisma schema and the
# BullMQ workers all live in the engine package, packages/core. This script
# installs the whole workspace and drives the engine through pnpm filters.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT_DIR="$PWD"
CORE_DIR="$ROOT_DIR/packages/core"
CORE="pnpm --filter @devnolife/karirku-core"

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

if [ ! -f "$CORE_DIR/.env.local" ]; then
  echo "📝 Creating packages/core/.env.local from its .env.example"
  cp "$CORE_DIR/.env.example" "$CORE_DIR/.env.local"
fi

echo "📦 Installing workspace dependencies..."
pnpm install

echo "🐳 Starting docker services (from $CORE_DIR)..."
(cd "$CORE_DIR" && docker compose up -d)

echo "⏳ Waiting for Postgres..."
for i in {1..30}; do
  if docker exec karirku-postgres pg_isready -U karirku -d karirku >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "🔧 Preparing the engine (migrations, seed, Prisma client, build)..."
$CORE db:deploy || $CORE db:migrate --name init
$CORE db:seed
pnpm core:build

echo "🤖 Pulling Ollama models (ini bisa ~5 menit pertama kali)..."
(cd "$CORE_DIR" && ./scripts/pull-models.sh)

echo
echo "✅ Setup selesai!"
echo "   pnpm dev        → jalankan Next.js"
echo "   pnpm worker     → jalankan BullMQ workers"
echo "   pnpm hunter status → cek Hunter"
echo "   $CORE ai:smoke  → test koneksi AI"
