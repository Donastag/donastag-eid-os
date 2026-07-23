#!/usr/bin/env bash
set -euo pipefail
FILE=${1:-}
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Usage: $0 <backup.sql.gz>"
  exit 1
fi
gunzip -c "$FILE" | docker compose exec -T postgres psql -U donastag
echo "Restored from $FILE"
