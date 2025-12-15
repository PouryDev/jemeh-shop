<?php

namespace App\Http\Middleware;

use App\Services\FeatureGateService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFeatureEnabled
{
    protected FeatureGateService $featureGate;

    public function __construct(FeatureGateService $featureGate)
    {
        $this->featureGate = $featureGate;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $feature  The feature name to check
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $merchant = \App\Models\Merchant::current();
        
        if (!$merchant) {
            abort(404, 'Merchant not found');
        }

        $hasAccess = match($feature) {
            'product_variants' => $this->featureGate->canUseProductVariants(),
            'campaigns' => $this->featureGate->canUseCampaigns(),
            'telegram_notifications' => $this->featureGate->canUseTelegramNotifications(),
            'custom_domain' => $this->featureGate->hasCustomDomain(),
            'custom_templates' => $this->featureGate->canUseCustomTemplates(),
            'analytics' => $this->featureGate->hasAnalyticsAccess() !== 'none',
            'analytics_full' => $this->featureGate->hasAnalyticsAccess() === 'full',
            default => false,
        };

        if (!$hasAccess) {
            abort(403, 'This feature is not available in your plan. Please upgrade to access this feature.');
        }

        return $next($request);
    }
}