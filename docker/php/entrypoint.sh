#!/usr/bin/env sh
set -euo pipefail

cd /var/www/html

# Ensure permissions
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# Install dependencies if vendor is missing
if [ ! -d "vendor" ]; then
  if [ -f "composer.json" ]; then
    composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader || true
  fi
fi

# Build frontend assets if missing
if [ -f "package.json" ]; then
  if [ ! -d "node_modules" ]; then
    npm ci --no-audit --no-fund --quiet || npm install --no-audit --no-fund --quiet || true
  fi
  # If using Laravel Vite plugin, built assets go to public/build
  if [ ! -d "public/build" ]; then
    npm run build || true
  fi
fi

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


