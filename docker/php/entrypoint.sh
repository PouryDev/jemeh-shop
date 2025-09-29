#!/usr/bin/env sh
set -euo pipefail

cd /var/www/html

# Ensure permissions
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# App key
if [ ! -f ".env" ]; then
  cp .env.example .env || true
fi

if ! grep -q "^APP_KEY=" .env || [ -z "$(grep '^APP_KEY=' .env | cut -d= -f2-)" ]; then
  php artisan key:generate --force || true
fi

# Cache config/routes for production
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

exec "$@"


