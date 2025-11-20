# =========================
# 1) Build Composer vendor
# =========================
FROM composer:2 AS composer

WORKDIR /app

# Copy only composer files to leverage Docker cache
COPY composer.json composer.lock ./

# Cài dependencies PHP cho production, không chạy scripts
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts


# =======================================
# 2) Final image: PHP-FPM + Nginx (Debian)
# =======================================
FROM php:8.2-fpm-bullseye

WORKDIR /var/www/html

# Cài system packages và PHP extensions
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

# Bật OPcache cho production
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.enable_cli=0'; \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.save_comments=1'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

# Copy vendor từ stage Composer
COPY --from=composer /app/vendor ./vendor

# Copy toàn bộ source (trừ những thứ ignore trong .dockerignore)
COPY . .

# Nginx config + entrypoint
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY .docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Tạo thư mục cần thiết và set quyền
RUN mkdir -p storage/framework storage/logs bootstrap/cache && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Laravel .env và php-fpm/nginx sẽ chạy dưới root (nginx master) + www-data (workers)
# nếu muốn chặt chẽ hơn có thể USER www-data, nhưng cho đơn giản ta để mặc định.

# Expose port (Render cung cấp $PORT runtime)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
