<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Register tenant routes
            Route::middleware([
                \Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
                \Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains::class,
            ])->group(base_path('routes/tenant.php'));
            
            Route::middleware([
                \Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
            ])->prefix('api')->group(base_path('routes/tenant-api.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register global middleware to convert Persian numbers to English
        $middleware->web(append: [
            \App\Http\Middleware\ConvertPersianNumbers::class,
        ]);
        
        $middleware->api(append: [
            \App\Http\Middleware\ConvertPersianNumbers::class,
        ]);
        
        // Replace default CSRF middleware with custom one for admin
        $middleware->web(replace: [
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class => \App\Http\Middleware\VerifyCsrfTokenForAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
