<?php

namespace Database\Seeders;

use App\Models\Theme;
use Illuminate\Database\Seeder;

class ThemeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $themes = [
            [
                'name' => 'پیش‌فرض',
                'slug' => 'default',
                'description' => 'قالب پیش‌فرض ساده و زیبا',
                'preview_image' => null,
                'config' => [
                    'primary_color' => '#3b82f6',
                    'secondary_color' => '#1e40af',
                    'font_family' => 'Vazir',
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'مدرن',
                'slug' => 'modern',
                'description' => 'قالب مدرن با طراحی خلاقانه',
                'preview_image' => null,
                'config' => [
                    'primary_color' => '#10b981',
                    'secondary_color' => '#059669',
                    'font_family' => 'Vazir',
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'مینیمال',
                'slug' => 'minimal',
                'description' => 'قالب مینیمال و ساده',
                'preview_image' => null,
                'config' => [
                    'primary_color' => '#6366f1',
                    'secondary_color' => '#4f46e5',
                    'font_family' => 'Vazir',
                ],
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($themes as $themeData) {
            Theme::updateOrCreate(
                ['slug' => $themeData['slug']],
                $themeData
            );
        }
    }
}