<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsTenantAdmin;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| These routes are loaded for each tenant domain. All routes here
| are automatically scoped to the current tenant.
|
*/

// React app routes for tenant shop
Route::get('/checkout', function () {
    return view('react-app');
})->name('checkout.index');

Route::get('/account', function () {
    return view('react-app');
})->name('account.index');

Route::get('/account/*', function () {
    return view('react-app');
});

// Auth routes for tenant
Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login'])->name('auth.login');
Route::post('/register', [\App\Http\Controllers\AuthController::class, 'register'])->name('auth.register');
Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout'])->name('auth.logout');

// Admin area for tenant (React app)
Route::middleware([EnsureUserIsTenantAdmin::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return view('react-app');
    })->name('dashboard');
    Route::get('/*', function () {
        return view('react-app');
    });
});

// Account API routes (for React to use)
Route::middleware('auth')->group(function () {
    Route::post('/account/profile', [\App\Http\Controllers\AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::post('/account/password', [\App\Http\Controllers\AccountController::class, 'updatePassword'])->name('account.password.update');
});

// Payment callback route (for gateway redirects)
Route::get('/payment/callback/{gateway}', [\App\Http\Controllers\Api\PaymentController::class, 'callback'])
    ->name('payment.callback');

// React SPA route - catch all for frontend routes (must be last)
Route::get('/{any}', function () {
    return view('react-app');
})->where('any', '.*')->name('react-app');

