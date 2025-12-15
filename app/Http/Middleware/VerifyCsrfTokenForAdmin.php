<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyCsrfTokenForAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip CSRF verification for all API routes
        if ($request->is('api/*')) {
            return $next($request);
        }

        // Skip CSRF verification for admin API routes and SaaS registration route (redundant but safe)
        if ($request->is('api/admin/*') || $request->is('api/saas/register')) {
            return $next($request);
        }

        // For regular web requests, apply CSRF verification
        return app(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)->handle($request, $next);
    }
}
