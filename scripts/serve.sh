#!/usr/bin/env bash
# ============================================================
# karirku-core — Control API runner
#
# Menjalankan HTTP control API supaya engine bisa dikendalikan
# dari mesin lain lewat jaringan.
#
#   ./scripts/serve.sh            # loopback saja (default, paling aman)
#   ./scripts/serve.sh --public   # bind 0.0.0.0 → bisa diakses via IP publik
#   ./scripts/serve.sh --tunnel   # loopback + cloudflared → URL https publik
# ============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.dev-logs"
ENV_FILE="$ROOT_DIR/.env.local"

log()  { echo -e "${CYAN}[core]${NC} $1" >&2; }
ok()   { echo -e "${GREEN}[ok]${NC}   $1" >&2; }
warn() { echo -e "${YELLOW}[warn]${NC} $1" >&2; }
err()  { echo -e "${RED}[err]${NC}  $1" >&2; }

MODE="local"
for arg in "$@"; do
  case "$arg" in
    --public) MODE="public" ;;
    --tunnel) MODE="tunnel" ;;
    --local)  MODE="local" ;;
    -h|--help)
      sed -n '2,12p' "${BASH_SOURCE[0]}" | sed 's/^# \?//'
      exit 0
      ;;
    *) err "Argumen tidak dikenal: $arg"; exit 2 ;;
  esac
done

mkdir -p "$LOG_DIR"
cd "$ROOT_DIR"

PORT="${CORE_PORT:-4310}"

# ------------------------------------------------------------
# Port bentrok
# ------------------------------------------------------------
if ss -ltn "sport = :$PORT" 2>/dev/null | grep -q LISTEN; then
  err "Port $PORT sudah dipakai. Set CORE_PORT ke port lain."
  exit 1
fi

# ------------------------------------------------------------
# API key — wajib begitu port keluar dari loopback.
# ------------------------------------------------------------
existing_key() {
  if [[ -n "${CORE_API_KEYS:-}" ]]; then
    echo "$CORE_API_KEYS"
  elif [[ -f "$ENV_FILE" ]]; then
    # `|| true`: no match is the normal first-run case, and under `pipefail`
    # grep's exit 1 would otherwise abort the whole script silently.
    { grep -E '^CORE_API_KEYS=' "$ENV_FILE" || true; } | tail -1 | cut -d= -f2- | tr -d '"'
  fi
}

if [[ "$MODE" != "local" ]]; then
  KEY="$(existing_key)"
  if [[ -z "$KEY" ]]; then
    KEY="$(openssl rand -hex 32)"
    printf '\n# Dibuat otomatis oleh scripts/serve.sh — jangan di-commit.\nCORE_API_KEYS="%s"\n' \
      "$KEY" >> "$ENV_FILE"
    warn "CORE_API_KEYS belum ada; key baru dibuat dan disimpan ke .env.local"
  fi
  export CORE_API_KEYS="$KEY"
  echo
  echo -e "${BLUE}  API key (pakai ini di client):${NC}"
  echo -e "  ${GREEN}$KEY${NC}"
  echo
fi

# ------------------------------------------------------------
# Alamat yang bisa dihubungi
# ------------------------------------------------------------
LAN_IP="$(ip -4 -o addr show scope global 2>/dev/null | awk '{print $4}' | cut -d/ -f1 | head -1)"

case "$MODE" in
  local)
    export CORE_HOST="${CORE_HOST:-127.0.0.1}"
    log "Mode lokal — hanya bisa diakses dari mesin ini."
    ;;
  public)
    export CORE_HOST="${CORE_HOST:-0.0.0.0}"
    warn "Mode publik — port $PORT terbuka ke jaringan. Auth wajib aktif."
    PUBLIC_IP="$(timeout 5 curl -fsS https://api.ipify.org 2>/dev/null || true)"
    echo
    [[ -n "$LAN_IP" ]]    && echo -e "  LAN    : ${GREEN}http://$LAN_IP:$PORT${NC}"
    [[ -n "$PUBLIC_IP" ]] && echo -e "  Publik : ${GREEN}http://$PUBLIC_IP:$PORT${NC}  ${YELLOW}(butuh port-forward/firewall)${NC}"
    echo
    if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
      warn "ufw aktif — izinkan dulu: sudo ufw allow $PORT/tcp"
    fi
    ;;
  tunnel)
    export CORE_HOST="127.0.0.1"
    command -v cloudflared >/dev/null 2>&1 || [[ -x "$HOME/bin/cloudflared" ]] || {
      err "cloudflared tidak ditemukan. Install dulu, atau pakai --public."
      exit 1
    }
    ;;
esac

# ------------------------------------------------------------
# Start
# ------------------------------------------------------------
CHILDREN=()
cleanup() {
  echo
  log "Menghentikan..."
  for pid in "${CHILDREN[@]:-}"; do
    # Negative PID = whole process group. pnpm spawns tsx which spawns node,
    # so killing just the pnpm pid would leave the port held by an orphan.
    [[ -n "$pid" ]] && kill -TERM -- "-$pid" 2>/dev/null || true
  done
}
trap cleanup INT TERM EXIT

if [[ "$MODE" == "tunnel" ]]; then
  CF="$(command -v cloudflared || echo "$HOME/bin/cloudflared")"
  log "Menjalankan control API di 127.0.0.1:$PORT ..."
  # setsid: the child leads its own process group, so cleanup can take the
  # whole tree down with one signal.
  setsid env CORE_PORT="$PORT" pnpm serve:dev > "$LOG_DIR/control-api.log" 2>&1 &
  CHILDREN+=($!)

  READY=0
  for _ in $(seq 1 60); do
    if curl -fsS "http://127.0.0.1:$PORT/health" >/dev/null 2>&1; then READY=1; break; fi
    sleep 0.5
  done
  if [[ "$READY" -ne 1 ]]; then
    err "Control API tidak merespons; cek $LOG_DIR/control-api.log"
    exit 1
  fi
  ok "Control API siap."

  log "Membuka tunnel cloudflared ..."
  setsid "$CF" tunnel --no-autoupdate --url "http://127.0.0.1:$PORT" \
    > "$LOG_DIR/tunnel.log" 2>&1 &
  CHILDREN+=($!)

  URL=""
  for _ in $(seq 1 60); do
    # `|| true`: an empty log is expected for the first few seconds, and under
    # `pipefail` grep's exit 1 would abort the script.
    URL="$({ grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/tunnel.log" 2>/dev/null || true; } | head -1)"
    [[ -n "$URL" ]] && break
    sleep 1
  done
  if [[ -n "$URL" ]]; then
    echo
    echo -e "  Publik : ${GREEN}$URL${NC}"
    echo -e "  Coba   : ${CYAN}CORE_URL=$URL CORE_API_KEY=$CORE_API_KEYS pnpm ctl status${NC}"
    echo
  else
    warn "URL tunnel belum terbaca; cek $LOG_DIR/tunnel.log"
  fi

  ok "Berjalan. Ctrl-C untuk berhenti."
  tail -f "$LOG_DIR/control-api.log"
else
  ok "Control API → $CORE_HOST:$PORT"
  exec env CORE_PORT="$PORT" pnpm serve:dev
fi
