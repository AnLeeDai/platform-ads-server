# Production Dockerfile: build assets, install deps, run PHP-FPM + Nginx

# Note: frontend build removed per user request to follow Laravel deployment docs.
# 1) Install Composer dependencies
FROM composer:2 AS composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# 3) Final image: PHP-FPM + Nginx on Debian
FROM php:8.2-fpm
WORKDIR /var/www/html

# Install system packages and PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx git unzip libpng-dev libjpeg-dev libfreetype6-dev libonig-dev libxml2-dev libzip-dev && \
    docker-php-ext-configure gd --with-jpeg --with-freetype && \
    docker-php-ext-install pdo pdo_mysql gd zip bcmath pcntl && \
    rm -rf /var/lib/apt/lists/*

# Copy vendor from composer stage
COPY --from=composer /app/vendor ./vendor

# Copy application files
COPY . .

# Nginx configuration and entrypoint
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY .docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create storage and cache dirs and set permissions
RUN mkdir -p storage/framework storage/logs bootstrap/cache && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true

# Expose port (Render will provide $PORT at runtime; entrypoint will rewrite nginx to listen on $PORT)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
