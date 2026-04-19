#!/usr/bin/env bash
# Pull model Ollama yang dipakai Karir.ai dev
set -euo pipefail

MODELS=("llama3.1:8b" "nomic-embed-text")

for model in "${MODELS[@]}"; do
  echo "⬇  ollama pull $model"
  docker exec karirku-ollama ollama pull "$model"
done

echo "✅ Models ready"
docker exec karirku-ollama ollama list
