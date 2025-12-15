<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Merchant;
use App\Models\Plan;
use App\Models\Theme;
use App\Models\Subscription;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get Enterprise plan (or create if doesn't exist)
        $enterprisePlan = Plan::where('slug', 'enterprise')->first();
        
        if (!$enterprisePlan) {
            $enterprisePlan = Plan::create([
                'name' => 'سازمانی',
                'slug' => 'enterprise',
                'description' => 'پلن سازمانی با دسترسی به تمام امکانات',
                'price_monthly' => 2000000,
                'price_yearly' => 20000000,
                'features' => [
                    'product_variants' => true,
                    'campaigns' => true,
                    'analytics' => 'full',
                    'telegram_notifications' => true,
                    'custom_domain' => true,
                    'custom_templates' => true,
                ],
                'limits' => [
                    'max_products' => null,
                    'max_slides' => null,
                    'max_delivery_methods' => null,
                    'commission_rate' => null,
                ],
                'is_active' => true,
                'sort_order' => 3,
            ]);
        }

        // Get default theme
        $defaultTheme = Theme::where('slug', 'default')->first();
        
        if (!$defaultTheme) {
            $defaultTheme = Theme::create([
                'name' => 'پیش‌فرض',
                'slug' => 'default',
                'description' => 'قالب پیش‌فرض ساده و زیبا',
                'is_active' => true,
                'sort_order' => 1,
            ]);
        }

        // Get first admin user or create a default one
        $adminUser = User::where('is_admin', true)->first();
        
        if (!$adminUser) {
            $adminUser = User::create([
                'name' => 'مدیر سیستم',
                'phone' => '09123456789',
                'password' => bcrypt('password'),
                'is_admin' => true,
            ]);
        }

        // Create default merchant for existing data
        $merchant = Merchant::create([
            'user_id' => $adminUser->id,
            'name' => 'فروشگاه پیش‌فرض',
            'slug' => 'default',
            'theme_id' => $defaultTheme->id,
            'plan_id' => $enterprisePlan->id,
            'subscription_status' => 'active',
            'is_active' => true,
        ]);

        // Create subscription for the merchant
        $subscription = Subscription::create([
            'merchant_id' => $merchant->id,
            'plan_id' => $enterprisePlan->id,
            'status' => 'active',
            'billing_cycle' => 'yearly',
            'current_period_start' => Carbon::now(),
            'current_period_end' => Carbon::now()->addYear(),
        ]);

        // Update all existing records with merchant_id
        $tables = [
            'products',
            'categories',
            'orders',
            'campaigns',
            'discount_codes',
            'hero_slides',
            'delivery_methods',
            'payment_gateways',
            'addresses',
            'transactions',
            'invoices',
        ];

        foreach ($tables as $table) {
            if (Schema::hasColumn($table, 'merchant_id')) {
                DB::table($table)
                    ->whereNull('merchant_id')
                    ->update(['merchant_id' => $merchant->id]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Find the default merchant
        $defaultMerchant = Merchant::where('slug', 'default')->first();
        
        if ($defaultMerchant) {
            // Remove merchant_id from all records (set to null)
            $tables = [
                'products',
                'categories',
                'orders',
                'campaigns',
                'discount_codes',
                'hero_slides',
                'delivery_methods',
                'payment_gateways',
                'addresses',
                'transactions',
                'invoices',
            ];

            foreach ($tables as $table) {
                if (Schema::hasColumn($table, 'merchant_id')) {
                    DB::table($table)
                        ->where('merchant_id', $defaultMerchant->id)
                        ->update(['merchant_id' => null]);
                }
            }

            // Delete subscription
            Subscription::where('merchant_id', $defaultMerchant->id)->delete();
            
            // Delete merchant
            $defaultMerchant->delete();
        }
    }
};