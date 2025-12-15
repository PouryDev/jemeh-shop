<?php

namespace App\Providers;

use App\Models\Merchant;
use App\Models\Order;
use App\Observers\OrderObserver;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        // Register Order Observer
        Order::observe(OrderObserver::class);

        // Register route model binding for Merchant
        Route::model('merchant', Merchant::class);
    }
}
