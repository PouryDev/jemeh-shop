<?php

namespace App\Http\Middleware;

use App\Models\Merchant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMerchantExists
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip merchant validation for SaaS/landing routes
        $path = $request->path();
        if ($request->is('api/saas/*') || 
            $path === 'landing' || 
            str_starts_with($path, 'landing/') ||
            str_starts_with($path, 'api/saas/')) {
            return $next($request);
        }

        // Get merchant from header (highest priority)
        $merchantId = $request->header('X-Merchant-Id');
        
        if (!$merchantId) {
            return response()->json([
                'success' => false,
                'message' => 'شناسه فروشگاه (X-Merchant-Id) در هدر درخواست یافت نشد'
            ], 400);
        }

        // Find and validate merchant
        $merchant = Merchant::where('id', $merchantId)
            ->where('is_active', true)
            ->first();

        if (!$merchant) {
            return response()->json([
                'success' => false,
                'message' => 'فروشگاه یافت نشد یا غیرفعال است'
            ], 404);
        }

        // Set merchant in request and app container
        $request->merge(['merchant' => $merchant]);
        app()->instance('merchant', $merchant);

        // Store merchant_id in session for future requests
        if ($request->hasSession()) {
            $request->session()->put('merchant_id', $merchant->id);
        }

        return $next($request);
    }
}
