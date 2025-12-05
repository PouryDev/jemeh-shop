<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Facades\Tenancy;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsTenantAdmin
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

        // Check if tenant is initialized
        if (!Tenancy::initialized()) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not initialized'
            ], 400);
        }

        $tenant = Tenancy::tenant();
        
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found'
            ], 404);
        }

        // Check if user is admin of this tenant
        if (!$user->isTenantAdmin($tenant)) {
            return response()->json([
                'success' => false,
                'message' => 'دسترسی غیرمجاز'
            ], 403);
        }

        return $next($request);
    }
}

