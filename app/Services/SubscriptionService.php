<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Subscription;
use Carbon\Carbon;

class SubscriptionService
{
    /**
     * Create a new subscription for a tenant
     */
    public function createSubscription(Tenant $tenant, string $planType): Subscription
    {
        // Deactivate any existing active subscriptions
        $tenant->subscriptions()
            ->where('status', 'active')
            ->update(['status' => 'cancelled']);

        // Create new subscription
        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_type' => $planType,
            'status' => 'active',
            'started_at' => now(),
            'expires_at' => $this->calculateExpirationDate($planType),
        ]);

        return $subscription;
    }

    /**
     * Update subscription plan for a tenant
     */
    public function updateSubscription(Tenant $tenant, string $planType): Subscription
    {
        $currentSubscription = $this->getCurrentSubscription($tenant);

        if ($currentSubscription && $currentSubscription->plan_type === $planType) {
            return $currentSubscription;
        }

        return $this->createSubscription($tenant, $planType);
    }

    /**
     * Get current active subscription for a tenant
     */
    public function getCurrentSubscription(Tenant $tenant): ?Subscription
    {
        return $tenant->subscription;
    }

    /**
     * Calculate expiration date based on plan type
     */
    private function calculateExpirationDate(string $planType): ?Carbon
    {
        // Starter plan is free forever (no expiration)
        if ($planType === 'starter') {
            return null;
        }

        // Pro plan expires after 1 month
        if ($planType === 'pro') {
            return now()->addMonth();
        }

        // Enterprise plan expires after 1 year (or can be null for unlimited)
        if ($planType === 'enterprise') {
            return now()->addYear();
        }

        return null;
    }

    /**
     * Check if subscription is active and valid
     */
    public function isSubscriptionActive(Tenant $tenant): bool
    {
        $subscription = $this->getCurrentSubscription($tenant);
        
        if (!$subscription) {
            return false;
        }

        return $subscription->isActive();
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(Tenant $tenant): bool
    {
        $subscription = $this->getCurrentSubscription($tenant);
        
        if (!$subscription) {
            return false;
        }

        $subscription->update(['status' => 'cancelled']);
        
        // Create a starter subscription as fallback
        $this->createSubscription($tenant, 'starter');

        return true;
    }
}

