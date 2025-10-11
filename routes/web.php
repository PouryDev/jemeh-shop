<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\ShopController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\DiscountCodeController as AdminDiscountCodeController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ColorController as AdminColorController;
use App\Http\Controllers\Admin\SizeController as AdminSizeController;
use App\Http\Controllers\Admin\ProductVariantController as AdminProductVariantController;
use App\Http\Controllers\Admin\CampaignController as AdminCampaignController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AccountController;

Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add/{product}', [CartController::class, 'add'])->name('cart.add');
Route::delete('/cart/remove/{cartKey}', [CartController::class, 'remove'])->name('cart.remove');
Route::get('/cart/json', [CartController::class, 'summary'])->name('cart.json');

Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'place'])->name('checkout.place');
Route::get('/thanks/{invoice}', [CheckoutController::class, 'thanks'])->name('checkout.thanks');

// Auth
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

// Admin area (simple gate)
Route::middleware([EnsureUserIsAdmin::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('admin.products.index');
    })->name('dashboard');

    Route::resource('products', AdminProductController::class)->except(['show']);
    Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::post('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('orders/{order}/verify', [AdminOrderController::class, 'verifyTransaction'])->name('orders.verify');
    
    Route::resource('discount-codes', AdminDiscountCodeController::class);
    Route::post('discount-codes/{discountCode}/toggle-status', [AdminDiscountCodeController::class, 'toggleStatus'])->name('discount-codes.toggle-status');
    
    Route::resource('categories', AdminCategoryController::class);
    Route::post('categories/{category}/toggle-status', [AdminCategoryController::class, 'toggleStatus'])->name('categories.toggle-status');
    
    Route::resource('colors', AdminColorController::class);
    Route::post('colors/{color}/toggle-status', [AdminColorController::class, 'toggleStatus'])->name('colors.toggle-status');
    
    Route::resource('sizes', AdminSizeController::class);
    Route::post('sizes/{size}/toggle-status', [AdminSizeController::class, 'toggleStatus'])->name('sizes.toggle-status');
    
    Route::resource('product-variants', AdminProductVariantController::class);
    Route::post('product-variants/{productVariant}/toggle-status', [AdminProductVariantController::class, 'toggleStatus'])->name('product-variants.toggle-status');
    
    Route::resource('campaigns', AdminCampaignController::class);
    Route::post('campaigns/{campaign}/toggle-status', [AdminCampaignController::class, 'toggleStatus'])->name('campaigns.toggle-status');
    Route::get('campaigns-analytics', [AdminCampaignController::class, 'analytics'])->name('campaigns.analytics');
});

// Account (auth required)
Route::middleware('auth')->group(function () {
    Route::get('/account', [AccountController::class, 'index'])->name('account.index');
    Route::get('/account/orders', [AccountController::class, 'orders'])->name('account.orders');
    Route::get('/account/orders/{order}', [AccountController::class, 'orderShow'])->name('account.orders.show');
    Route::get('/account/settings', [AccountController::class, 'settings'])->name('account.settings');
    Route::post('/account/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::post('/account/password', [AccountController::class, 'updatePassword'])->name('account.password.update');
});

// React SPA route - catch all for frontend routes (must be last)
Route::get('/{any}', function () {
    return view('react-app');
})->where('any', '.*')->name('react-app');
