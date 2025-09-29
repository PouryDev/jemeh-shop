# Production PHP-FPM image for Laravel
FROM php:8.3-fpm-alpine AS base

RUN set -eux; \
    apk add --no-cache bash icu-dev oniguruma-dev libzip-dev libpng-dev freetype-dev libjpeg-turbo-dev curl git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_mysql intl mbstring zip gd bcmath \
    && apk add --no-cache libpng freetype libjpeg-turbo icu-libs oniguruma libzip \
    && apk del --no-network freetype-dev libjpeg-turbo-dev libpng-dev icu-dev oniguruma-dev libzip-dev

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/html

# Copy project (we will bind-mount in compose, but keep a copy for image-only runs)
COPY . /var/www/html

# Optimize permissions for runtime directories
RUN set -eux; \
    mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Entrypoint
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]


