#!/usr/bin/env sh
set -e

cd /app

if [ -f ".env" ]; then
  echo "[entrypoint] Using existing .env"
else
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "[entrypoint] Copied .env.example to .env"
  else
    echo "[entrypoint] WARNING: No .env or .env.example found"
  fi
fi

if [ -z "${APP_KEY:-}" ]; then
  if ! grep -q "APP_KEY=" .env || [ "$(grep -E "APP_KEY=.*" .env | cut -d'=' -f2)" = "" ]; then
    echo "[entrypoint] Generating APP_KEY"
    php artisan key:generate --force || true
  fi
fi

if [ "${RUN_MIGRATIONS_ON_START:-false}" = "true" ]; then
    echo "[entrypoint] Running migrations..."
    php artisan migrate --force || true
fi

if [ ! -L public/storage ]; then
  echo "[entrypoint] Creating storage symlink..."
  php artisan storage:link || true
fi

echo "[entrypoint] Caching Laravel config/routes/views..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

chown -R www-data:www-data storage bootstrap/cache || true

PORT="${PORT:-8000}"
WORKERS="${OCTANE_WORKERS:-4}"
MAX_REQUESTS="${OCTANE_MAX_REQUESTS:-500}"

echo "[entrypoint] Starting Octane (FrankenPHP) on 0.0.0.0:${PORT} workers=${WORKERS} max_requests=${MAX_REQUESTS}"

exec php artisan octane:frankenphp \
    --host=0.0.0.0 \
    --port="${PORT}" \
    --workers="${WORKERS}" \
    --max-requests="${MAX_REQUESTS}"