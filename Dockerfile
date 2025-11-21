FROM composer:2 AS composer

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts


# =======================================
# 2) Final image: PHP-FPM + Nginx
# =======================================
FROM php:8.2-fpm-bullseye

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    git \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    && docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install pdo pdo_mysql gd zip bcmath pcntl opcache \
    && rm -rf /var/lib/apt/lists/*

# OPcache tối ưu cho production
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.enable_cli=0'; \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=50000'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.revalidate_path=0'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.jit=1205'; \
    echo 'opcache.jit_buffer_size=64M'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

# Copy vendor từ stage composer
COPY --from=composer /app/vendor ./vendor

# Copy source
COPY . .

# Nginx config + entrypoint
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY .docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p storage/framework storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
