<?php

namespace App\Http\Middleware;

use App\Models\Merchant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class IdentifyMerchant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip merchant identification for SaaS registration route (it's on landing page)
        if ($request->is('api/saas/register') || $request->is('api/saas/plans') || $request->is('api/saas/themes')) {
            // Set merchant to null for landing page routes
            app()->instance('merchant', null);
            return $next($request);
        }
        
        // Skip merchant identification for landing page routes
        $path = $request->path();
        if ($path === 'landing' || str_starts_with($path, 'landing/')) {
            // Set merchant to null for landing page routes (prevents "target class merchant does not exist" error)
            app()->instance('merchant', null);
            // Clear merchant_id from session for landing page
            if ($request->hasSession()) {
                $request->session()->forget('merchant_id');
            }
            return $next($request);
        }
        
        $host = $request->getHost();
        $merchant = $this->identifyMerchant($host, $request);
        
        if ($merchant) {
            // Set merchant globally so it can be accessed via app('merchant') or Merchant::current()
            app()->instance('merchant', $merchant);
            
            // Set merchant in request for easy access
            // IMPORTANT: Don't use merge() for FormData requests as it overwrites FormData fields
            // Instead, add merchant to request attributes which won't interfere with FormData parsing
            $request->attributes->set('merchant', $merchant);
            
            // Also merge for non-FormData requests (GET, JSON, etc.)
            if (!$request->isMethod('POST') && !$request->isMethod('PUT') && !$request->isMethod('PATCH')) {
                $request->merge(['merchant' => $merchant]);
            }
            
            // Add merchant_id to response header for frontend
            $response = $next($request);
            return $response->header('X-Merchant-Id', $merchant->id);
        } else {
            // Set merchant to null if no merchant found (prevents "target class merchant does not exist" error)
            app()->instance('merchant', null);
        }
        
        return $next($request);
    }

    /**
     * Identify merchant based on route parameter, header, query parameter, domain/subdomain, session, or authenticated user
     */
    protected function identifyMerchant(string $host, Request $request): ?Merchant
    {
        // First, try to get merchant from route parameter (highest priority for route-based identification)
        $route = $request->route();
        if ($route && $route->hasParameter('merchantId')) {
            $merchantId = $route->parameter('merchantId');
            $merchant = Merchant::where('id', $merchantId)
                ->orWhere('slug', $merchantId)
                ->where('is_active', true)
                ->first();
            
            if ($merchant) {
                // Store merchant_id in session for future requests
                if ($request->hasSession()) {
                    $request->session()->put('merchant_id', $merchant->id);
                }
                return $merchant;
            }
        }
        
        // Second, try to get merchant from header (X-Merchant-Id) - high priority as it comes from client
        // Accept both ID and slug (for route-based identification)
        if ($request->hasHeader('X-Merchant-Id')) {
            $merchantId = $request->header('X-Merchant-Id');
            $merchant = Merchant::where('id', $merchantId)
                ->orWhere('slug', $merchantId)
                ->where('is_active', true)
                ->first();
            
            if ($merchant) {
                // Store merchant_id in session for future requests
                if ($request->hasSession()) {
                    $request->session()->put('merchant_id', $merchant->id);
                }
                return $merchant;
            }
        }
        
        // Second, try to get merchant from query parameter (for post-registration redirect)
        // Don't cache this as it's a one-time redirect
        if ($request->has('merchant_id')) {
            $merchantId = $request->query('merchant_id');
            $merchant = Merchant::where('id', $merchantId)
                ->where('is_active', true)
                ->first();
            
            if ($merchant) {
                // Store merchant_id in session for future requests
                if ($request->hasSession()) {
                    $request->session()->put('merchant_id', $merchant->id);
                }
                return $merchant;
            }
        }
        
        // Try to get merchant from session (for subsequent requests)
        if ($request->hasSession() && $request->session()->has('merchant_id')) {
            $merchantId = $request->session()->get('merchant_id');
            $merchant = Merchant::where('id', $merchantId)
                ->where('is_active', true)
                ->first();
            
            if ($merchant) {
                return $merchant;
            }
        }
        
        // If user is authenticated and no merchant found yet, try to get merchant from user
        if (Auth::check()) {
            $user = Auth::user();
            $merchant = Merchant::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();
            
            if ($merchant) {
                // Store merchant_id in session for future requests
                if ($request->hasSession()) {
                    $request->session()->put('merchant_id', $merchant->id);
                }
                return $merchant;
            }
        }
        
        // Cache merchant lookup for performance (only for domain-based detection)
        return Cache::remember("merchant:{$host}", 3600, function () use ($host) {
            // Try to find by custom domain first
            $merchant = Merchant::where('domain', $host)
                ->where('is_active', true)
                ->first();
            
            if ($merchant) {
                return $merchant;
            }
            
            // Try to find by subdomain
            $mainDomain = config('app.main_domain');
            if ($mainDomain && str_ends_with($host, '.' . $mainDomain)) {
                $subdomain = str_replace('.' . $mainDomain, '', $host);
                $merchant = Merchant::where('subdomain', $subdomain)
                    ->where('is_active', true)
                    ->first();
                
                if ($merchant) {
                    return $merchant;
                }
            }
            
            // If no merchant found and we're on the main domain, return null (landing page)
            $appUrlHost = parse_url(config('app.url'), PHP_URL_HOST);
            
            // Normalize hosts for comparison (remove port if present)
            $normalizedHost = $host;
            $normalizedMainDomain = $mainDomain ?: '';
            $normalizedAppUrlHost = $appUrlHost ?: '';
            
            // Check if we're on the main domain (with or without port)
            if ($host === $mainDomain || 
                $host === $appUrlHost || 
                (!$mainDomain && !$appUrlHost) ||
                ($mainDomain && str_starts_with($host, $mainDomain . ':')) ||
                ($appUrlHost && str_starts_with($host, $appUrlHost . ':'))) {
                return null;
            }
            
            return null;
        });
    }
}