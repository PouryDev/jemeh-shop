<?php

namespace App\Jobs;

use App\Models\Subscription;
use App\Services\SubscriptionService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessSubscriptionRenewals implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(SubscriptionService $subscriptionService): void
    {
        Log::info('[ProcessSubscriptionRenewals] Starting subscription renewal process');

        // Expire subscriptions that have ended
        $expiredCount = $subscriptionService->expireSubscriptions();
        Log::info("[ProcessSubscriptionRenewals] Expired {$expiredCount} subscriptions");

        // Find subscriptions that need renewal (ending in 3 days or less)
        $subscriptionsToRenew = Subscription::where('status', 'active')
            ->whereNotNull('current_period_end')
            ->where('current_period_end', '<=', Carbon::now()->addDays(3))
            ->where('current_period_end', '>', Carbon::now())
            ->with(['merchant', 'plan'])
            ->get();

        foreach ($subscriptionsToRenew as $subscription) {
            try {
                // Check if payment is due
                $lastPayment = $subscription->payments()
                    ->where('status', 'paid')
                    ->latest('paid_at')
                    ->first();

                // If no payment found or payment was before current period start
                if (!$lastPayment || 
                    ($subscription->current_period_start && 
                     $lastPayment->paid_at && 
                     $lastPayment->paid_at->lt($subscription->current_period_start))) {
                    
                    Log::info("[ProcessSubscriptionRenewals] Subscription {$subscription->id} needs payment for renewal");
                    
                    // Here you can trigger payment request or send reminder
                    // For now, we'll just log it
                    // In production, you might want to trigger a payment gateway request
                } else {
                    Log::info("[ProcessSubscriptionRenewals] Subscription {$subscription->id} already paid, auto-renewing");
                    $subscriptionService->renewSubscription($subscription);
                }
            } catch (\Exception $e) {
                Log::error("[ProcessSubscriptionRenewals] Error processing subscription {$subscription->id}: " . $e->getMessage());
            }
        }

        Log::info('[ProcessSubscriptionRenewals] Subscription renewal process completed');
    }
}