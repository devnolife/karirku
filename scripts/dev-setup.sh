#!/usr/bin/env bash
# Karir.ai — one-shot dev setup for the web app.
#
# Infrastructure (Postgres, Redis, MinIO, Ollama), the Prisma schema and the
# BullMQ workers all live in the engine repo, devnolife/karirku-core. This
# script sets up the web app and delegates the rest to that repo, which it
# expects to be checked out as a sibling directory.
set -euo pipefail

cd "$(dirname "$0")/.."
WEB_DIR="$PWD"
CORE_DIR="${KARIRKU_CORE_DIR:-$WEB_DIR/../karirku-core}"

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

if [ ! -d "$CORE_DIR" ]; then
  echo "❌ Engine repo not found at $CORE_DIR"
  echo "   git clone https://github.com/devnolife/karirku-core.git $CORE_DIR"
  echo "   …or set KARIRKU_CORE_DIR to point at your checkout."
  exit 1
fi

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
(
  cd "$CORE_DIR"
  pnpm install
  pnpm db:deploy || pnpm db:migrate --name init
  pnpm db:seed
  pnpm build
)

echo "📦 Installing web dependencies..."
pnpm install

echo "🤖 Pulling Ollama models (ini bisa ~5 menit pertama kali)..."
(cd "$CORE_DIR" && ./scripts/pull-models.sh)

echo
echo "✅ Setup selesai!"
echo "   pnpm dev                       → jalankan Next.js (repo ini)"
echo "   (cd $CORE_DIR && pnpm worker)  → jalankan BullMQ workers"
echo "   (cd $CORE_DIR && pnpm ai:smoke)→ test koneksi AI"
