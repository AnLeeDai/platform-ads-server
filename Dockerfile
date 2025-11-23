# ----- Stage 1: Composer -----
FROM composer:2 AS composer_stage

WORKDIR /app
COPY composer.json composer.lock ./

RUN composer install \
    --ignore-platform-reqs \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader


# ----- Stage 2: PHP Runtime -----
FROM php:8.3-fpm-bookworm

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    git \
    unzip \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libpq-dev \
 && docker-php-ext-configure gd --with-jpeg --with-freetype \
 && docker-php-ext-install pdo_mysql pdo_pgsql gd zip bcmath pcntl opcache \
 && pecl install apcu \
 && docker-php-ext-enable apcu \
 && rm -rf /var/lib/apt/lists/*

RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.enable_cli=0'; \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=50000'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.fast_shutdown=1'; \
} > /usr/local/etc/php/conf.d/opcache.ini


# Copy vendor từ Composer stage
COPY --from=composer_stage /app/vendor ./vendor

# Copy toàn bộ mã nguồn
COPY . .

# Copy cấu hình
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY .docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Laravel storage permission
RUN mkdir -p storage/framework storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
