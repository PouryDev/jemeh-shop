<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'پایه',
                'slug' => 'basic',
                'description' => 'پلن پایه برای فروشگاه‌های کوچک',
                'price_monthly' => 0, // رایگان یا قیمت پایه
                'price_yearly' => 0,
                'features' => [
                    'product_variants' => false,
                    'campaigns' => false,
                    'analytics' => 'none',
                    'telegram_notifications' => false,
                    'custom_domain' => false,
                    'custom_templates' => false,
                ],
                'limits' => [
                    'max_products' => 20,
                    'max_slides' => 2,
                    'max_delivery_methods' => 2,
                    'commission_rate' => 10.0, // 10% commission
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'حرفه‌ای',
                'slug' => 'professional',
                'description' => 'پلن حرفه‌ای برای کسب‌وکارهای متوسط',
                'price_monthly' => 500000, // 500 هزار تومان
                'price_yearly' => 5000000, // 5 میلیون تومان (سالانه)
                'features' => [
                    'product_variants' => true,
                    'campaigns' => true,
                    'analytics' => 'basic',
                    'telegram_notifications' => true,
                    'custom_domain' => true,
                    'custom_templates' => true,
                ],
                'limits' => [
                    'max_products' => null, // unlimited
                    'max_slides' => 5,
                    'max_delivery_methods' => 5,
                    'commission_rate' => null, // no commission
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'سازمانی',
                'slug' => 'enterprise',
                'description' => 'پلن سازمانی با دسترسی به تمام امکانات',
                'price_monthly' => 2000000, // 2 میلیون تومان
                'price_yearly' => 20000000, // 20 میلیون تومان (سالانه)
                'features' => [
                    'product_variants' => true,
                    'campaigns' => true,
                    'analytics' => 'full',
                    'telegram_notifications' => true,
                    'custom_domain' => true,
                    'custom_templates' => true,
                ],
                'limits' => [
                    'max_products' => null, // unlimited
                    'max_slides' => null, // unlimited
                    'max_delivery_methods' => null, // unlimited
                    'commission_rate' => null, // no commission
                ],
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $planData) {
            Plan::updateOrCreate(
                ['slug' => $planData['slug']],
                $planData
            );
        }
    }
}