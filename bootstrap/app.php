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
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Session middleware for API routes (needed for SaaS registration login)
        $middleware->api(prepend: [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
        ]);
        
        // Identify merchant based on domain/subdomain (must be after session)
        $middleware->web(prepend: [
            \App\Http\Middleware\IdentifyMerchant::class,
        ]);
        
        $middleware->api(prepend: [
            \App\Http\Middleware\IdentifyMerchant::class,
        ]);
        
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
