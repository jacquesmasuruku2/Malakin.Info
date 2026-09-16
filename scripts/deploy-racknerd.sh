#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PM2_APP_NAME="${PM2_APP_NAME:-malakinfo}"

echo "==> Updating ${ROOT_DIR} to origin/master"
git fetch origin master
git checkout master
git reset --hard origin/master

echo "==> Installing dependencies"
npm ci

echo "==> Building (prisma migrate deploy + next build)"
npm run build

echo "==> Restarting PM2 process ${PM2_APP_NAME}"
if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 is not installed or not in PATH for this SSH user."
  exit 1
fi

if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  echo "PM2 process '${PM2_APP_NAME}' not found. Start it once on the server, then rerun."
  exit 1
fi

pm2 save
echo "==> Deploy finished"
