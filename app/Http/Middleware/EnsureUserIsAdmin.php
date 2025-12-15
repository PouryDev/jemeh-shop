<?php

namespace App\Http\Middleware;

use App\Models\Merchant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'لطفاً ابتدا وارد حساب کاربری خود شوید'
                ], 401);
            }
            return redirect('/');
        }

        $user = Auth::user();
        
        // Check if user is super admin (is_admin in users table)
        if ($user->is_admin) {
            return $next($request);
        }

        // Check if user is admin in current merchant
        $merchant = Merchant::current();
        if ($merchant && $user->isAdminOf($merchant)) {
            return $next($request);
        }

        // User is not admin
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'شما دسترسی به پنل ادمین ندارید'
            ], 403);
        }
        
        return redirect('/');
    }
}


