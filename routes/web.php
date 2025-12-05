<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\EnsureUserIsSuperAdmin;

/*
|--------------------------------------------------------------------------
| Platform Routes (Central Domain)
|--------------------------------------------------------------------------
|
| These routes are loaded for the central platform domain. These routes
| handle tenant registration, management, and super-admin functionality.
|
*/

// Landing page - show when no tenant is detected
Route::get('/', function () {
    return view('landing');
})->name('landing');

// Platform authentication routes
Route::post('/platform/login', [\App\Http\Controllers\Platform\AuthController::class, 'login'])->name('platform.auth.login');
Route::post('/platform/register', [\App\Http\Controllers\Platform\AuthController::class, 'register'])->name('platform.auth.register');
Route::post('/platform/logout', [\App\Http\Controllers\Platform\AuthController::class, 'logout'])->name('platform.auth.logout');

// Platform tenant management (for users to manage their tenants)
Route::middleware('auth:sanctum')->prefix('platform')->name('platform.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Platform\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/tenants', [\App\Http\Controllers\Platform\TenantController::class, 'index'])->name('tenants.index');
    Route::post('/tenants', [\App\Http\Controllers\Platform\TenantController::class, 'store'])->name('tenants.store');
    Route::get('/tenants/{tenant}', [\App\Http\Controllers\Platform\TenantController::class, 'show'])->name('tenants.show');
    Route::put('/tenants/{tenant}', [\App\Http\Controllers\Platform\TenantController::class, 'update'])->name('tenants.update');
    Route::delete('/tenants/{tenant}', [\App\Http\Controllers\Platform\TenantController::class, 'destroy'])->name('tenants.destroy');
});

// Super Admin routes
Route::middleware(['auth:sanctum', EnsureUserIsSuperAdmin::class])->prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'dashboard'])->name('dashboard');
    Route::get('/tenants', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'index'])->name('tenants.index');
    Route::get('/tenants/{tenant}', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'show'])->name('tenants.show');
    Route::put('/tenants/{tenant}', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'update'])->name('tenants.update');
    Route::delete('/tenants/{tenant}', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'destroy'])->name('tenants.destroy');
    Route::post('/tenants/{tenant}/activate', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'activate'])->name('tenants.activate');
    Route::post('/tenants/{tenant}/deactivate', [\App\Http\Controllers\SuperAdmin\TenantManagementController::class, 'deactivate'])->name('tenants.deactivate');
});

// React app route for platform (catch all - must be last)
Route::get('/{any}', function () {
    return view('react-app');
})->where('any', '.*')->name('platform-app');
