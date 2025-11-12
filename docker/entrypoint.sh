#!/bin/bash

# Start MariaDB in the background for initialization
/usr/bin/mysqld_safe --skip-networking &

# Wait for MariaDB to be ready
until mysqladmin ping -h"127.0.0.1" --silent; do
    echo "Waiting for MariaDB to be ready..."
    sleep 2
done

echo "MariaDB is up - executing database setup"

# Setup database and user
mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};"
mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD}';"
mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'localhost';"
mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "FLUSH PRIVILEGES;"

# Stop MariaDB to be managed by supervisord
mysqladmin -uroot -p"${MYSQL_ROOT_PASSWORD}" shutdown

echo "MariaDB setup complete. Starting supervisord."

# Start supervisord
/usr/bin/supervisord -c /etc/supervisor/supervisord.conf
