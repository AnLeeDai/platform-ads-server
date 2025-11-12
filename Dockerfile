# Use a Debian base image
FROM debian:bullseye

# Set environment variables for MySQL
ENV MYSQL_ROOT_PASSWORD=secret
ENV MYSQL_DATABASE=laravel
ENV MYSQL_USER=laravel
ENV MYSQL_PASSWORD=secret

# Update and install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    php8.2-fpm \
    php8.2-mysql \
    php8.2-zip \
    php8.2-gd \
    php8.2-mbstring \
    php8.2-xml \
    php8.2-bcmath \
    php8.2-curl \
    php8.2-intl \
    php-sqlite3 \
    php-pgsql \
    php-opcache \
    php-cli \
    git \
    curl \
    unzip \
    mariadb-server \
    mariadb-client \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Configure PHP-FPM
RUN sed -i 's/listen = \/run\/php\/php8.2-fpm.sock/listen = 127.0.0.1:9000/g' /etc/php/8.2/fpm/pool.d/www.conf
RUN sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/g' /etc/php/8.2/fpm/php.ini
RUN sed -i 's/memory_limit = 128M/memory_limit = 256M/g' /etc/php/8.2/fpm/php.ini
RUN sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 128M/g' /etc/php/8.2/fpm/php.ini
RUN sed -i 's/post_max_size = 8M/post_max_size = 128M/g' /etc/php/8.2/fpm/php.ini
RUN chown -R www-data:www-data /var/www

# Install phpMyAdmin
RUN mkdir -p /var/www/phpmyadmin
RUN curl -L https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip -o /tmp/phpmyadmin.zip \
    && unzip /tmp/phpmyadmin.zip -d /var/www/phpmyadmin \
    && mv /var/www/phpmyadmin/phpMyAdmin-5.2.1-all-languages/* /var/www/phpmyadmin \
    && rm -rf /var/www/phpmyadmin/phpMyAdmin-5.2.1-all-languages /tmp/phpmyadmin.zip
COPY docker/phpmyadmin/config.inc.php /var/www/phpmyadmin/config.inc.php
RUN chown -R www-data:www-data /var/www/phpmyadmin

# Configure Nginx for Laravel and phpMyAdmin
COPY docker/nginx/nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
RUN rm -f /etc/nginx/sites-enabled/default.conf # Ensure no default Nginx config remains

# Set working directory for Laravel
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Generate application key
RUN php artisan key:generate

# Clear and cache configurations
RUN php artisan config:clear
RUN php artisan cache:clear
RUN php artisan view:clear
RUN php artisan route:clear
RUN php artisan event:clear

RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache
RUN php artisan event:cache

# Set proper permissions
RUN chown -R www-data:www-data storage bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# Copy supervisord configuration
COPY docker/supervisord.conf /etc/supervisor/supervisord.conf

# Copy and set up entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose ports
EXPOSE 80
EXPOSE 3306

# Use the entrypoint script to start all services
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"] # Supervisord will be the main process