<?php

namespace App\Services;

use App\Models\Merchant;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    /**
     * Create a new subscription for a merchant
     */
    public function createSubscription(
        Merchant $merchant,
        Plan $plan,
        string $billingCycle = 'monthly',
        bool $startTrial = false
    ): Subscription {
        return DB::transaction(function () use ($merchant, $plan, $billingCycle, $startTrial) {
            // Cancel existing subscription if any
            $existingSubscription = $merchant->subscription;
            if ($existingSubscription && $existingSubscription->isActive()) {
                $this->cancelSubscription($existingSubscription);
            }

            $now = Carbon::now();
            $periodStart = $now;
            $periodEnd = $now->copy();
            $trialEndsAt = null;

            if ($startTrial) {
                $trialEndsAt = $now->copy()->addDays(14); // 14 days trial
                $status = 'trial';
            } else {
                if ($billingCycle === 'yearly') {
                    $periodEnd->addYear();
                } else {
                    $periodEnd->addMonth();
                }
                $status = 'active';
            }

            $subscription = Subscription::create([
                'merchant_id' => $merchant->id,
                'plan_id' => $plan->id,
                'status' => $status,
                'billing_cycle' => $billingCycle,
                'current_period_start' => $periodStart,
                'current_period_end' => $periodEnd,
                'trial_ends_at' => $trialEndsAt,
            ]);

            // Update merchant plan and subscription status
            $merchant->update([
                'plan_id' => $plan->id,
                'subscription_status' => $status,
            ]);

            return $subscription;
        });
    }

    /**
     * Renew subscription
     */
    public function renewSubscription(Subscription $subscription): Subscription
    {
        return DB::transaction(function () use ($subscription) {
            $subscription->renew();
            
            $subscription->merchant->update([
                'subscription_status' => 'active',
            ]);

            return $subscription->fresh();
        });
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(Subscription $subscription): Subscription
    {
        return DB::transaction(function () use ($subscription) {
            $subscription->update([
                'status' => 'canceled',
                'canceled_at' => Carbon::now(),
            ]);

            $subscription->merchant->update([
                'subscription_status' => 'canceled',
            ]);

            return $subscription->fresh();
        });
    }

    /**
     * Upgrade or downgrade plan
     */
    public function changePlan(
        Merchant $merchant,
        Plan $newPlan,
        string $billingCycle = 'monthly'
    ): Subscription {
        return DB::transaction(function () use ($merchant, $newPlan, $billingCycle) {
            $existingSubscription = $merchant->subscription;

            if ($existingSubscription && $existingSubscription->isActive()) {
                // Update existing subscription
                $existingSubscription->update([
                    'plan_id' => $newPlan->id,
                    'billing_cycle' => $billingCycle,
                ]);

                $merchant->update([
                    'plan_id' => $newPlan->id,
                ]);

                return $existingSubscription->fresh();
            } else {
                // Create new subscription
                return $this->createSubscription($merchant, $newPlan, $billingCycle);
            }
        });
    }

    /**
     * Record a subscription payment
     */
    public function recordPayment(
        Subscription $subscription,
        int $amount,
        ?int $transactionId = null,
        string $status = 'paid'
    ): SubscriptionPayment {
        return SubscriptionPayment::create([
            'subscription_id' => $subscription->id,
            'amount' => $amount,
            'status' => $status,
            'transaction_id' => $transactionId,
            'paid_at' => $status === 'paid' ? Carbon::now() : null,
        ]);
    }

    /**
     * Process payment and renew subscription
     */
    public function processPayment(
        Subscription $subscription,
        int $amount,
        ?int $transactionId = null
    ): Subscription {
        return DB::transaction(function () use ($subscription, $amount, $transactionId) {
            // Record payment
            $this->recordPayment($subscription, $amount, $transactionId, 'paid');

            // Renew subscription
            return $this->renewSubscription($subscription);
        });
    }

    /**
     * Check and expire subscriptions
     */
    public function expireSubscriptions(): int
    {
        $expiredCount = 0;

        Subscription::whereIn('status', ['active', 'trial'])
            ->where(function ($query) {
                $query->where(function ($q) {
                    $q->where('status', 'trial')
                      ->where('trial_ends_at', '<=', Carbon::now());
                })->orWhere(function ($q) {
                    $q->where('status', 'active')
                      ->where('current_period_end', '<=', Carbon::now());
                });
            })
            ->each(function ($subscription) use (&$expiredCount) {
                $subscription->update([
                    'status' => 'expired',
                ]);

                $subscription->merchant->update([
                    'subscription_status' => 'expired',
                ]);

                $expiredCount++;
            });

        return $expiredCount;
    }

    /**
     * Calculate subscription price
     */
    public function calculatePrice(Plan $plan, string $billingCycle): int
    {
        return $billingCycle === 'yearly' 
            ? $plan->price_yearly 
            : $plan->price_monthly;
    }
}


