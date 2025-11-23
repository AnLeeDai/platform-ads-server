FROM composer:2 AS composer_stage

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --ignore-platform-reqs \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader


FROM dunglas/frankenphp:1-php8.3

WORKDIR /app

RUN install-php-extensions \
    pdo_mysql \
    pdo_pgsql \
    gd \
    zip \
    bcmath \
    pcntl \
    opcache

COPY . .
COPY --from=composer_stage /app/vendor ./vendor

RUN mkdir -p storage/framework storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY .docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]