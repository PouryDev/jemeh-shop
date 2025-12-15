<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule subscription renewal processing (daily)
Schedule::call(function () {
    \App\Jobs\ProcessSubscriptionRenewals::dispatch();
})->daily();

// Schedule subscription reminders (daily at 9 AM)
Schedule::call(function () {
    \App\Jobs\SendSubscriptionReminders::dispatch();
})->dailyAt('09:00');

// Schedule subscription expiration check (hourly)
Schedule::call(function () {
    $subscriptionService = app(\App\Services\SubscriptionService::class);
    $subscriptionService->expireSubscriptions();
})->hourly();
