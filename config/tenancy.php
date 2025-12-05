<?php

declare(strict_types=1);

return [
    'tenant_model' => \App\Models\Tenant::class,
    'domain_model' => \App\Models\Domain::class,
    'id_generator' => Stancl\Tenancy\UUIDGenerator::class,

    /**
     * The list of domains hosting your central app.
     */
    'central_domains' => [
        '127.0.0.1',
        'localhost',
        env('APP_DOMAIN', 'platform.local'),
    ],

    /**
     * Tenancy bootstrappers are executed when tenancy is initialized.
     */
    'bootstrappers' => [
        Stancl\Tenancy\Bootstrappers\DatabaseTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\CacheTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\FilesystemTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\QueueTenancyBootstrapper::class,
    ],

    /**
     * Tenancy middleware groups are applied automatically to all tenant routes.
     */
    'middleware_groups' => [
        'web' => [
            Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
            Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains::class,
        ],
        'api' => [
            Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
        ],
    ],

    /**
     * Tenancy middleware is applied on demand to tenant routes.
     */
    'middleware' => [
        Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
        Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains::class,
    ],

    /**
     * Features are classes that provide additional functionality to Tenancy.
     */
    'features' => [
        // Stancl\Tenancy\Features\UserImpersonation::class,
        // Stancl\Tenancy\Features\CrossDomainRedirect::class,
        // Stancl\Tenancy\Features\TenantConfig::class,
        // Stancl\Tenancy\Features\ViteBundles::class,
    ],

    /**
     * Should tenancy routes be registered.
     */
    'routes' => true,

    /**
     * Parameters used by the tenants:list command.
     */
    'tenant_artisan_search_fields' => [
        'id',
        'domain',
    ],

    /**
     * Database configuration for single database mode.
     */
    'database' => [
        'central_connection' => env('DB_CONNECTION', 'mariadb'),
        'template_tenant_connection_name' => 'tenant',
        'template_central_connection_name' => 'central',
    ],

    /**
     * Used by the database bootstrapper. The name of the column where the tenant id is stored.
     */
    'tenant_database_key_name' => 'tenant_id',
];
