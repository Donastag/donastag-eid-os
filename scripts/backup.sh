#!/usr/bin/env bash
set -euo pipefail
DATE=$(date +%Y%m%d-%H%M%S)
OUT=${1:-backups/donastag-$DATE.sql.gz}
mkdir -p "$(dirname "$OUT")"
docker compose exec -T postgres pg_dump -U donastag | gzip > "$OUT"
echo "Backup written to $OUT"
