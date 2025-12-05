<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\EnsureUserIsSuperAdmin;

/*
|--------------------------------------------------------------------------
| Platform API Routes (Central Domain)
|--------------------------------------------------------------------------
|
| These API routes are loaded for the central platform domain.
|
*/

// Platform authentication API
Route::post('/platform/auth/login', [\App\Http\Controllers\Platform\AuthController::class, 'login']);
Route::post('/platform/auth/register', [\App\Http\Controllers\Platform\AuthController::class, 'register']);

// Platform tenant management API (for users to manage their tenants)
Route::middleware('auth:sanctum')->prefix('platform')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Platform\DashboardController::class, 'index']);
    Route::get('/tenants', [\App\Http\Controllers\Platform\TenantController::class, 'index']);
    Route::post('/tenants', [\App\Http\Controllers\Platform\TenantController::class, 'store']);
    Route::get('/tenants/{tenant}', [\App\Http\Controllers\Platform\TenantController::class, 'show']);
    Route::put('/tenants/{tenant}', [\App\Http\Controllers\Platform\TenantController::class, 'update']);
    Route::delete('/tenants/{tenant}', [\App\Http\Controllers\Platform\TenantController::class, 'destroy']);
    
    // Subscription management
    Route::get('/tenants/{tenant}/subscription', [\App\Http\Controllers\Platform\SubscriptionController::class, 'show']);
    Route::put('/tenants/{tenant}/subscription', [\App\Http\Controllers\Platform\SubscriptionController::class, 'update']);
    Route::get('/tenants/{tenant}/usage', [\App\Http\Controllers\Platform\SubscriptionController::class, 'usage']);
    
    Route::post('/auth/logout', [\App\Http\Controllers\Platform\AuthController::class, 'logout']);
    Route::get('/auth/user', [\App\Http\Controllers\Platform\AuthController::class, 'user']);
});

// Super Admin API routes
Route::middleware(['auth:sanctum', EnsureUserIsSuperAdmin::class])->prefix('super-admin')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'dashboard']);
    Route::get('/tenants', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'index']);
    Route::get('/tenants/{tenant}', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'show']);
    Route::put('/tenants/{tenant}', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'update']);
    Route::delete('/tenants/{tenant}', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'destroy']);
    Route::post('/tenants/{tenant}/activate', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'activate']);
    Route::post('/tenants/{tenant}/deactivate', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'deactivate']);
});
