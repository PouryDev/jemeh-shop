<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Facades\Tenancy;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect('/login');
        }

        $user = Auth::user();
        
        // Super admin has access to all tenants
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // If we're in a tenant context, check tenant admin
        if (Tenancy::initialized()) {
            $tenant = Tenancy::tenant();
            if ($tenant && $user->isTenantAdmin($tenant)) {
                return $next($request);
            }
        }

        // Legacy: check is_admin flag (for backward compatibility)
        if ($user->is_admin) {
            return $next($request);
        }

        return redirect('/');
    }
}


