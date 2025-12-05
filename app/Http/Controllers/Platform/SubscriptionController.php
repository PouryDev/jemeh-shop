<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Tenant;
use App\Services\SubscriptionService;
use App\Services\UsageTrackingService;
use App\Services\PlanService;

class SubscriptionController extends Controller
{
    protected $subscriptionService;
    protected $usageTrackingService;
    protected $planService;

    public function __construct(
        SubscriptionService $subscriptionService,
        UsageTrackingService $usageTrackingService,
        PlanService $planService
    ) {
        $this->subscriptionService = $subscriptionService;
        $this->usageTrackingService = $usageTrackingService;
        $this->planService = $planService;
    }

    /**
     * Show current subscription for a tenant
     */
    public function show(Request $request, Tenant $tenant)
    {
        $user = Auth::user();
        
        // Check if user has access to this tenant
        if (!$user->isSuperAdmin() && !$user->tenants()->where('tenants.id', $tenant->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'دسترسی غیرمجاز',
            ], 403);
        }

        $subscription = $this->subscriptionService->getCurrentSubscription($tenant);
        $usageStats = $this->usageTrackingService->getUsageStats($tenant);
        $usageSummary = $this->planService->getUsageSummary($tenant);

        return response()->json([
            'success' => true,
            'data' => [
                'subscription' => $subscription,
                'usage_stats' => $usageStats,
                'usage_summary' => $usageSummary,
            ],
        ]);
    }

    /**
     * Update subscription plan
     */
    public function update(Request $request, Tenant $tenant)
    {
        $user = Auth::user();
        
        // Check if user has access to this tenant
        if (!$user->isSuperAdmin() && !$user->tenants()->where('tenants.id', $tenant->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'دسترسی غیرمجاز',
            ], 403);
        }

        $request->validate([
            'plan_type' => 'required|in:starter,pro,enterprise',
        ]);

        $subscription = $this->subscriptionService->updateSubscription($tenant, $request->plan_type);

        return response()->json([
            'success' => true,
            'message' => 'پلن با موفقیت به‌روزرسانی شد',
            'data' => $subscription,
        ]);
    }

    /**
     * Get usage statistics
     */
    public function usage(Request $request, Tenant $tenant)
    {
        $user = Auth::user();
        
        // Check if user has access to this tenant
        if (!$user->isSuperAdmin() && !$user->tenants()->where('tenants.id', $tenant->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'دسترسی غیرمجاز',
            ], 403);
        }

        $usageStats = $this->usageTrackingService->getUsageStats($tenant);
        $usageSummary = $this->planService->getUsageSummary($tenant);

        return response()->json([
            'success' => true,
            'data' => [
                'usage_stats' => $usageStats,
                'usage_summary' => $usageSummary,
            ],
        ]);
    }
}

