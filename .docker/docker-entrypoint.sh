#!/usr/bin/env sh
set -e

# If APP_KEY is not set, try to generate one (only if .env.example exists)
if [ -f ".env" ]; then
  echo "Using existing .env"
else
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Copied .env.example to .env"
  fi
fi

# Install composer dependencies if vendor missing
if [ ! -d vendor ] || [ ! -f vendor/autoload.php ]; then
  echo "Installing composer dependencies..."
  composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader || true
fi

# Generate APP_KEY if not set in env and not present in .env
if [ -z "$APP_KEY" ]; then
  if ! grep -q "APP_KEY=" .env 2>/dev/null || [ "$(grep -E "APP_KEY=.*" .env | sed -n '1p' | cut -d'=' -f2)" = "" ]; then
    echo "Generating APP_KEY"
    php artisan key:generate --force || true
  fi
fi

# Create storage link if not exists
if [ ! -L public/storage ]; then
  php artisan storage:link || true
fi

# Ensure permissions
chown -R www-data:www-data storage bootstrap/cache || true

# Start php-fpm in background
echo "Starting php-fpm..."
php-fpm -D

# If nginx.conf contains a placeholder for port, replace it with $PORT (Render sets $PORT at runtime)
if [ -n "${PORT}" ]; then
  echo "Setting nginx to listen on port ${PORT}"
  sed -i "s/__PORT__/${PORT}/g" /etc/nginx/conf.d/default.conf || true
else
  echo "PORT not set, using default 8080"
  sed -i "s/__PORT__/8080/g" /etc/nginx/conf.d/default.conf || true
fi

# Start the command (nginx in foreground by default)
exec "$@"
