<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Merchant;
use App\Models\MerchantUser;
use App\Models\User;
use App\Models\Theme;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SaasController extends Controller
{
    protected SubscriptionService $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Get all active plans
     */
    public function plans()
    {
        $plans = Plan::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }

    /**
     * Register a new merchant
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subdomain' => 'required|string|max:63|alpha_dash|unique:merchants,subdomain',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:255|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
            'plan_id' => 'nullable|exists:plans,id',
            'theme_id' => 'nullable|exists:themes,id',
        ]);

        return DB::transaction(function () use ($validated) {
            // Get or create user
            $user = User::where('phone', $validated['phone'])->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $validated['name'],
                    'phone' => $validated['phone'],
                    'password' => Hash::make($validated['password']),
                ]);
            } else {
                // User exists, check password
                if (!Hash::check($validated['password'], $user->password)) {
                    throw ValidationException::withMessages([
                        'phone' => ['این شماره تلفن قبلاً ثبت شده است. لطفاً رمز عبور صحیح را وارد کنید.'],
                    ]);
                }
            }

            // Check if user already has a merchant
            $existingMerchant = Merchant::where('user_id', $user->id)->first();
            if ($existingMerchant) {
                return response()->json([
                    'success' => false,
                    'message' => 'شما قبلاً یک فروشگاه ثبت کرده‌اید',
                    'merchant' => $existingMerchant->load('plan', 'theme'),
                ], 422);
            }

            // Get default plan (Basic) if not specified
            $plan = $validated['plan_id'] 
                ? Plan::findOrFail($validated['plan_id'])
                : Plan::where('slug', 'basic')->firstOrFail();

            // Get default theme if not specified
            $theme = $validated['theme_id']
                ? Theme::findOrFail($validated['theme_id'])
                : Theme::where('slug', 'default')->firstOrFail();

            // Create merchant with initial settings
            $merchant = Merchant::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'slug' => Str::slug($validated['subdomain']),
                'subdomain' => $validated['subdomain'],
                'theme_id' => $theme->id,
                'plan_id' => $plan->id,
                'subscription_status' => 'trial',
                'is_active' => true,
                'settings' => [
                    'website_title' => $validated['name'],
                    'logo_path' => null,
                ],
            ]);

            // Create merchant user with admin role
            MerchantUser::create([
                'merchant_id' => $merchant->id,
                'user_id' => $user->id,
                'role' => 'admin', // Keep for backward compatibility
                'is_admin' => true, // New admin flag
            ]);

            // Create subscription with trial
            $subscription = $this->subscriptionService->createSubscription(
                $merchant,
                $plan,
                'monthly',
                true // start trial
            );

            // Create Sanctum token
            $token = $user->createToken('merchant-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'فروشگاه با موفقیت ثبت شد',
                'data' => [
                    'merchant' => $merchant->load('plan', 'theme', 'subscription'),
                    'user' => $user,
                    'token' => $token,
                ],
            ], 201);
        });
    }

    /**
     * Subscribe to a plan or change plan
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'لطفاً ابتدا وارد حساب کاربری خود شوید'
            ], 401);
        }

        $merchant = Merchant::where('user_id', $user->id)->first();
        
        if (!$merchant) {
            return response()->json([
                'success' => false,
                'message' => 'فروشگاهی یافت نشد'
            ], 404);
        }

        $plan = Plan::findOrFail($validated['plan_id']);

        return DB::transaction(function () use ($merchant, $plan, $validated) {
            // Change plan
            $subscription = $this->subscriptionService->changePlan(
                $merchant,
                $plan,
                $validated['billing_cycle']
            );

            // Calculate price
            $price = $this->subscriptionService->calculatePrice($plan, $validated['billing_cycle']);

            // If plan is not free, return payment info
            if ($price > 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'پلن با موفقیت تغییر کرد. لطفاً پرداخت را انجام دهید.',
                    'data' => [
                        'subscription' => $subscription->load('plan'),
                        'merchant' => $merchant->fresh()->load('plan', 'theme'),
                        'amount' => $price,
                        'billing_cycle' => $validated['billing_cycle'],
                        'payment_required' => true,
                    ],
                ]);
            }

            // Free plan - no payment needed
            return response()->json([
                'success' => true,
                'message' => 'پلن با موفقیت تغییر کرد',
                'data' => [
                    'subscription' => $subscription->load('plan'),
                    'merchant' => $merchant->fresh()->load('plan', 'theme'),
                    'payment_required' => false,
                ],
            ]);
        });
    }
}
