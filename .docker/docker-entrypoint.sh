set -e

cd /var/www/html

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

CPU_CORES=$(getconf _NPROCESSORS_ONLN 2>/dev/null || nproc 2>/dev/null || echo 2)

PHP_FPM_MAX_CHILDREN=${PHP_FPM_MAX_CHILDREN:-$((CPU_CORES * 10))}
PHP_FPM_START_SERVERS=${PHP_FPM_START_SERVERS:-$((CPU_CORES * 2))}
PHP_FPM_MIN_SPARE=${PHP_FPM_MIN_SPARE:-$CPU_CORES}
PHP_FPM_MAX_SPARE=${PHP_FPM_MAX_SPARE:-$((CPU_CORES * 4))}

cat > /usr/local/etc/php-fpm.d/www.conf <<EOF
[www]
user = www-data
group = www-data

listen = 127.0.0.1:9000
listen.mode = 0660
listen.allowed_clients = any

pm = dynamic
pm.max_children = ${PHP_FPM_MAX_CHILDREN}
pm.start_servers = ${PHP_FPM_START_SERVERS}
pm.min_spare_servers = ${PHP_FPM_MIN_SPARE}
pm.max_spare_servers = ${PHP_FPM_MAX_SPARE}
pm.max_requests = 500

request_terminate_timeout = 30s

access.log = /proc/self/fd/2
catch_workers_output = yes
clear_env = no

slowlog = /proc/self/fd/2
request_slowlog_timeout = 5s

php_admin_value[memory_limit] = 256M
php_admin_value[upload_max_filesize] = 100M
php_admin_value[post_max_size] = 100M
php_admin_value[max_execution_time] = 30
php_admin_value[error_log] = /proc/self/fd/2
php_admin_flag[log_errors] = on
EOF

echo "[entrypoint] PHP-FPM tuned: cores=${CPU_CORES}"

php-fpm -D

if [ -n "${PORT:-}" ]; then
  sed -i "s/__PORT__/${PORT}/g" /etc/nginx/conf.d/default.conf
else
  sed -i "s/__PORT__/8080/g" /etc/nginx/conf.d/default.conf
fi

exec "$@"