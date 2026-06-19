#!/usr/bin/env bash
# User-space Postgres + pgvector untuk Karir.ai (no sudo, no docker).
# Pakai binary postgresql-14 + pgvector 0.8.1 yang sudah di-extract.
set -euo pipefail

PG_ROOT="${PG_ROOT:-$(cd "$(dirname "$0")/.." && pwd)/.docker/pg-local/install}"
PG_BIN="$PG_ROOT/usr/lib/postgresql/14/bin"
PG_LIB="$PG_ROOT/usr/lib/postgresql/14/lib:$PG_ROOT/usr/lib/x86_64-linux-gnu"
DATA_DIR="${DATA_DIR:-$(cd "$(dirname "$0")/.." && pwd)/.docker/pg-local/data}"
SOCK_DIR="${SOCK_DIR:-$(dirname "$DATA_DIR")/sock}"
PORT="${PG_PORT:-5439}"

if [ ! -x "$PG_BIN/pg_ctl" ]; then
  echo "❌ Binary Postgres tidak ditemukan di $PG_BIN"
  echo "   Re-extract: cd /tmp/pgsetup && dpkg-deb -x *.deb root/"
  exit 1
fi

mkdir -p "$SOCK_DIR"

cmd="${1:-start}"
export LD_LIBRARY_PATH="$PG_LIB"

case "$cmd" in
  start)
    "$PG_BIN/pg_ctl" -D "$DATA_DIR" -l "$DATA_DIR/../logfile" \
      -o "-p $PORT -k $SOCK_DIR -h 127.0.0.1" start
    ;;
  stop)
    "$PG_BIN/pg_ctl" -D "$DATA_DIR" stop
    ;;
  status)
    "$PG_BIN/pg_ctl" -D "$DATA_DIR" status
    ;;
  psql)
    shift
    "$PG_BIN/psql" -h 127.0.0.1 -p "$PORT" -U karirku -d karirku "$@"
    ;;
  *)
    echo "Usage: $0 {start|stop|status|psql}"
    exit 1
    ;;
esac
