<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SearchController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public API routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/campaigns/active', [CampaignController::class, 'active']);
Route::get('/categories', [CategoryController::class, 'index']);

// Search endpoint for React
Route::get('/search', [ProductController::class, 'search']);

// New search endpoint for dropdown
Route::get('/search/dropdown', [SearchController::class, 'search']);

// CSRF token refresh endpoint
Route::get('/csrf-token', function () {
    return response()->json([
        'success' => true,
        'token' => csrf_token()
    ]);
});

// Auth routes (using web middleware for session support)
Route::middleware('web')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth');
    Route::get('/auth/user', [AuthController::class, 'user'])->middleware('auth');
});

// Protected routes (using web middleware for session support)
Route::middleware(['web', 'auth'])->group(function () {
    // Cart routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/update', [CartController::class, 'update']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'remove']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    
    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    
    // User profile routes
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::get('/user/orders', [UserController::class, 'orders']);
    Route::get('/user/stats', [UserController::class, 'stats']);
     
    // Address management
    Route::apiResource('addresses', \App\Http\Controllers\Api\AddressController::class);
    Route::post('/addresses/{address}/set-default', [\App\Http\Controllers\Api\AddressController::class, 'setDefault']);
    
    // Delivery methods
    Route::get('/delivery-methods', function () {
        $deliveryMethods = \App\Models\DeliveryMethod::active()->ordered()->get();
        return response()->json([
            'success' => true,
            'data' => $deliveryMethods
        ]);
    });
});

// Admin API routes
Route::middleware(['web', 'auth', \App\Http\Middleware\EnsureUserIsAdmin::class])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\Api\AdminDashboardController::class, 'index']);
    
    // Products
        Route::apiResource('products', \App\Http\Controllers\Api\AdminProductController::class);
        Route::delete('products/{product}/images/{image}', [\App\Http\Controllers\Api\AdminProductController::class, 'destroyImage']);
    
    // Categories, Colors, Sizes
    Route::get('/categories', function () {
        $categories = \App\Models\Category::where('is_active', true)->orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $categories]);
    });
    
    Route::get('/colors', function () {
        $colors = \App\Models\Color::orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $colors]);
    });
    
    Route::get('/sizes', function () {
        $sizes = \App\Models\Size::orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $sizes]);
    });
    
    // Orders
    Route::get('/orders', function () {
        $orders = \App\Models\Order::with(['user', 'items.product.images', 'items.color', 'items.size', 'deliveryAddress', 'deliveryMethod'])
            ->latest()
            ->get();
        return response()->json(['success' => true, 'data' => $orders]);
    });
    
    Route::get('/orders/{order}', function ($orderId) {
        $order = \App\Models\Order::with([
            'user', 
            'items.product.images', 
            'items.color', 
            'items.size', 
            'deliveryAddress', 
            'deliveryMethod'
        ])->findOrFail($orderId);
        return response()->json(['success' => true, 'data' => $order]);
    });
    
    Route::patch('/orders/{order}/status', function (\Illuminate\Http\Request $request, $orderId) {
        $order = \App\Models\Order::findOrFail($orderId);
        $order->update(['status' => $request->input('status')]);
        return response()->json(['success' => true, 'data' => $order]);
    });
    
    // Delivery Methods
    Route::get('/delivery-methods', function () {
        $methods = \App\Models\DeliveryMethod::ordered()->get();
        return response()->json(['success' => true, 'data' => $methods]);
    });
    
    Route::post('/delivery-methods', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'fee' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);
        
        $method = \App\Models\DeliveryMethod::create($validated);
        return response()->json(['success' => true, 'data' => $method]);
    });
    
    Route::put('/delivery-methods/{method}', function (\Illuminate\Http\Request $request, $methodId) {
        $method = \App\Models\DeliveryMethod::findOrFail($methodId);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'fee' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);
        
        $method->update($validated);
        return response()->json(['success' => true, 'data' => $method]);
    });
    
    Route::delete('/delivery-methods/{method}', function ($methodId) {
        $method = \App\Models\DeliveryMethod::findOrFail($methodId);
        
        // Check if method is used in any orders
        if ($method->orders()->count() > 0) {
            return response()->json([
                'success' => false, 
                'message' => 'این روش ارسال در سفارشات استفاده شده و قابل حذف نیست'
            ], 400);
        }
        
        $method->delete();
        return response()->json(['success' => true, 'message' => 'روش ارسال با موفقیت حذف شد']);
    });

    // Discount Codes
    Route::get('/discount-codes', function () {
        $discounts = \App\Models\DiscountCode::latest()->get();
        return response()->json(['success' => true, 'data' => $discounts]);
    });
    
    Route::get('/discount-codes/{id}', function ($id) {
        $discount = \App\Models\DiscountCode::findOrFail($id);
        return response()->json(['success' => true, 'data' => $discount]);
    });
    
    Route::post('/discount-codes', function (\Illuminate\Http\Request $request) {
        $data = $request->validate([
            'code' => 'required|string|unique:discount_codes,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|integer|min:0',
            'minimum_amount' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'usage_limit' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);
        
        $discount = \App\Models\DiscountCode::create($data);
        return response()->json(['success' => true, 'data' => $discount]);
    });
    
    Route::put('/discount-codes/{id}', function (\Illuminate\Http\Request $request, $id) {
        $discount = \App\Models\DiscountCode::findOrFail($id);
        $data = $request->validate([
            'code' => 'required|string|unique:discount_codes,code,' . $id,
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|integer|min:0',
            'minimum_amount' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'usage_limit' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);
        
        $discount->update($data);
        return response()->json(['success' => true, 'data' => $discount]);
    });
    
    Route::delete('/discount-codes/{id}', function ($id) {
        $discount = \App\Models\DiscountCode::findOrFail($id);
        $discount->delete();
        return response()->json(['success' => true, 'message' => 'کد تخفیف حذف شد']);
    });
    
    Route::patch('/discount-codes/{id}/toggle', function ($id) {
        $discount = \App\Models\DiscountCode::findOrFail($id);
        $discount->update(['is_active' => !$discount->is_active]);
        return response()->json(['success' => true, 'data' => $discount]);
    });
    
    // Campaigns
    Route::get('/campaigns', function () {
        $campaigns = \App\Models\Campaign::with('products')->latest()->get();
        return response()->json(['success' => true, 'data' => $campaigns]);
    });
    
    Route::get('/campaigns/{id}', function ($id) {
        $campaign = \App\Models\Campaign::with('products')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $campaign]);
    });
    
    Route::post('/campaigns', function (\Illuminate\Http\Request $request) {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id'
        ]);
        
        $campaign = \App\Models\Campaign::create($data);
        $campaign->products()->attach($data['product_ids']);
        
        return response()->json(['success' => true, 'data' => $campaign->load('products')]);
    });
    
    Route::put('/campaigns/{id}', function (\Illuminate\Http\Request $request, $id) {
        $campaign = \App\Models\Campaign::findOrFail($id);
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id'
        ]);
        
        $campaign->update($data);
        $campaign->products()->sync($data['product_ids']);
        
        return response()->json(['success' => true, 'data' => $campaign->load('products')]);
    });
    
    Route::delete('/campaigns/{id}', function ($id) {
        $campaign = \App\Models\Campaign::findOrFail($id);
        $campaign->delete();
        return response()->json(['success' => true, 'message' => 'کمپین حذف شد']);
    });
    
    Route::patch('/campaigns/{id}/toggle', function ($id) {
        $campaign = \App\Models\Campaign::findOrFail($id);
        $campaign->update(['is_active' => !$campaign->is_active]);
        return response()->json(['success' => true, 'data' => $campaign]);
    });
});
