#!/usr/bin/env bash
# Runs Drizzle Studio in Docker, reachable only from this machine.
# Usage (Git Bash, from anywhere): bash scripts/db-studio.sh
#
# Studio's SQL endpoint has no auth and allows any browser origin (CORS "*"),
# so: publish the port on loopback only (127.0.0.1:4983, never plain 4983),
# keep it running only while you use it (Ctrl+C to stop), and prefer a
# non-production DATABASE_URL. Inside the container Studio must listen on
# 0.0.0.0 so Docker can forward to it; the loopback-only -p keeps it private.
set -euo pipefail

cd "$(dirname "$0")/.."
project="$(pwd -W 2>/dev/null || pwd)"

# Studio will print a "?host=0.0.0.0" link; browsers block 0.0.0.0, so use this one.
echo "Open https://local.drizzle.studio (Ctrl+C here to stop Studio)"

MSYS_NO_PATHCONV=1 exec docker run --rm -it --name atelier-studio \
  -p 127.0.0.1:4983:4983 \
  -v "$project:/app" -w /app \
  node:24-alpine \
  npx drizzle-kit studio --host 0.0.0.0 --port 4983
