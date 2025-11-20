#!/usr/bin/env sh
set -e

cd /var/www/html

# 1. Chuẩn bị .env nếu chưa có
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

# 2. Generate APP_KEY nếu chưa có (và APP_KEY env chưa set)
if [ -z "$APP_KEY" ]; then
  if ! grep -q "APP_KEY=" .env 2>/dev/null || [ "$(grep -E "APP_KEY=.*" .env | sed -n '1p' | cut -d'=' -f2)" = "" ]; then
    echo "[entrypoint] Generating APP_KEY"
    php artisan key:generate --force || echo "[entrypoint] Failed to generate APP_KEY (maybe artisan not ready?)"
  fi
fi

# 3. Migrate DB (OPTIONAL – nếu bạn muốn auto migrate khi deploy)
# Uncomment nếu phù hợp:
echo "[entrypoint] Running migrations..."
php artisan migrate --force || echo "[entrypoint] Migration failed"

# 4. Tạo storage link nếu chưa có
if [ ! -L public/storage ]; then
  echo "[entrypoint] Creating storage symlink..."
  php artisan storage:link || echo "[entrypoint] Failed to create storage symlink"
fi

# 5. Cache config/route/view để max performance
echo "[entrypoint] Caching Laravel config/routes/views..."
php artisan config:cache || echo "[entrypoint] config:cache failed"
php artisan route:cache || echo "[entrypoint] route:cache failed"
php artisan view:cache || echo "[entrypoint] view:cache failed"

# 6. Set quyền
chown -R www-data:www-data storage bootstrap/cache || true

# 7. Start php-fpm (background)
echo "[entrypoint] Starting php-fpm..."
php-fpm -D

# 8. Thay __PORT__ trong nginx.conf bằng $PORT (Render)
if [ -n "${PORT}" ]; then
  echo "[entrypoint] Setting nginx to listen on port ${PORT}"
  sed -i "s/__PORT__/${PORT}/g" /etc/nginx/conf.d/default.conf || true
else
  echo "[entrypoint] PORT not set, using default 8080"
  sed -i "s/__PORT__/8080/g" /etc/nginx/conf.d/default.conf || true
fi

# 9. Start nginx (foreground – giữ container sống)
exec "$@"
