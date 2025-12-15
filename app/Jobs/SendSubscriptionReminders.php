<?php

namespace App\Jobs;

use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSubscriptionReminders implements ShouldQueue
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
    public function handle(): void
    {
        Log::info('[SendSubscriptionReminders] Starting subscription reminder process');

        // Send reminders for subscriptions ending in 7 days
        $reminderDate = Carbon::now()->addDays(7);
        
        $subscriptionsToRemind = Subscription::where('status', 'active')
            ->whereNotNull('current_period_end')
            ->whereBetween('current_period_end', [
                Carbon::now()->addDays(6),
                Carbon::now()->addDays(8)
            ])
            ->with(['merchant.user', 'plan'])
            ->get();

        foreach ($subscriptionsToRemind as $subscription) {
            try {
                $merchant = $subscription->merchant;
                $user = $merchant->user;
                $plan = $subscription->plan;
                
                $daysRemaining = Carbon::now()->diffInDays($subscription->current_period_end, false);
                
                // Here you can send email/SMS notification
                // For now, we'll just log it
                Log::info("[SendSubscriptionReminders] Sending reminder to merchant {$merchant->id} - {$daysRemaining} days remaining");
                
                // Example: You can dispatch a notification job here
                // SendSubscriptionReminderNotification::dispatch($subscription);
                
            } catch (\Exception $e) {
                Log::error("[SendSubscriptionReminders] Error sending reminder for subscription {$subscription->id}: " . $e->getMessage());
            }
        }

        // Send final reminders for subscriptions ending in 1 day
        $finalReminderDate = Carbon::now()->addDay();
        
        $subscriptionsForFinalReminder = Subscription::where('status', 'active')
            ->whereNotNull('current_period_end')
            ->whereBetween('current_period_end', [
                Carbon::now(),
                Carbon::now()->addDays(2)
            ])
            ->with(['merchant.user', 'plan'])
            ->get();

        foreach ($subscriptionsForFinalReminder as $subscription) {
            try {
                $merchant = $subscription->merchant;
                
                Log::info("[SendSubscriptionReminders] Sending final reminder to merchant {$merchant->id}");
                
                // Send final reminder notification
                // SendSubscriptionFinalReminderNotification::dispatch($subscription);
                
            } catch (\Exception $e) {
                Log::error("[SendSubscriptionReminders] Error sending final reminder for subscription {$subscription->id}: " . $e->getMessage());
            }
        }

        Log::info('[SendSubscriptionReminders] Subscription reminder process completed');
    }
}