<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\Color;
use App\Models\Size;
use App\Models\ProductVariant;
use Illuminate\Support\Str;

class ProductionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories
        $accessoriesCategory = Category::firstOrCreate(
            ['name' => 'اکسسوری'],
            ['slug' => Str::slug('اکسسوری'), 'description' => 'دسته‌بندی اکسسوری']
        );

        $shoesCategory = Category::firstOrCreate(
            ['name' => 'کفش'],
            ['slug' => Str::slug('کفش'), 'description' => 'دسته‌بندی کفش']
        );

        $pantsCategory = Category::firstOrCreate(
            ['name' => 'شلوار'],
            ['slug' => Str::slug('شلوار'), 'description' => 'دسته‌بندی شلوار']
        );

        // Create colors
        $colors = [
            'مشکی' => '#000000',
            'صورتی' => '#FF69B4',
            'سبز' => '#00FF00',
            'نقره‌ای' => '#C0C0C0',
            'سفید' => '#FFFFFF',
            'قرمز' => '#FF0000',
            'آبی' => '#0000FF',
            'طلایی' => '#FFD700',
            'سیلور' => '#C0C0C0',
            'برنجی' => '#CD7F32',
            'گلد' => '#FFD700',
        ];

        $colorModels = [];
        foreach ($colors as $name => $hex) {
            $colorModels[$name] = Color::firstOrCreate(
                ['name' => $name],
                ['hex_code' => $hex, 'is_active' => true]
            );
        }

        // Create sizes
        $sizes = ['37', '38', '39', '40', '29', '30', '31', '32', '33'];
        $sizeModels = [];
        foreach ($sizes as $name) {
            $sizeModels[$name] = Size::firstOrCreate(
                ['name' => $name],
                ['is_active' => true]
            );
        }

        // Products data
        $products = [
            [
                'name' => 'کاسیو نوستالژی',
                'category' => 'اکسسوری',
                'price' => 590000,
                'stock' => 10,
                'description' => 'کاسیو نوستالژی. تمام استیل رنگ ثابت',
                'variants' => [
                    ['color' => 'مشکی', 'size' => null, 'price' => null, 'stock' => 10]
                ]
            ],
            [
                'name' => 'کاسیو توستالژی',
                'category' => 'اکسسوری',
                'price' => 550000,
                'stock' => 0,
                'description' => 'کاسیو نوستالژی صفحه رنگی تمام استیل',
                'variants' => [
                    ['color' => 'صورتی', 'size' => null, 'price' => 550000, 'stock' => 5],
                    ['color' => 'سبز', 'size' => null, 'price' => 550000, 'stock' => 5],
                    ['color' => 'نقره‌ای', 'size' => null, 'price' => 550000, 'stock' => 5],
                ]
            ],
            [
                'name' => 'ساعت کرکره‌ای',
                'category' => 'اکسسوری',
                'price' => 630000,
                'stock' => 5,
                'description' => 'ساعت کرکره‌ای رنگ ثابت تمام استیل ضد حساسیت',
                'variants' => []
            ],
            [
                'name' => 'ساعت کاسیو مردونه',
                'category' => 'اکسسوری',
                'price' => 590000,
                'stock' => 5,
                'description' => 'کاسیو نوستالژی تمام استیل رنگ ثابت ضد حساسیت',
                'variants' => []
            ],
            [
                'name' => 'جا کلیدی کفش جردن',
                'category' => 'اکسسوری',
                'price' => 280000,
                'stock' => 0,
                'description' => 'جاسویچی جردن. رنگ بندی طبق عکس',
                'variants' => [
                    ['color' => 'سبز', 'size' => null, 'price' => null, 'stock' => 6],
                    ['color' => 'سفید', 'size' => null, 'price' => null, 'stock' => 6],
                    ['color' => 'قرمز', 'size' => null, 'price' => null, 'stock' => 6],
                    ['color' => 'آبی', 'size' => null, 'price' => null, 'stock' => 6],
                    ['color' => 'مشکی', 'size' => null, 'price' => null, 'stock' => 6],
                ]
            ],
            [
                'name' => 'گردنبند ستاره‌ای',
                'category' => 'اکسسوری',
                'price' => 210000,
                'stock' => 0,
                'description' => 'گردنی ستاره‌ای رنگ ثابت تمام استیل',
                'variants' => [
                    ['color' => 'طلایی', 'size' => null, 'price' => null, 'stock' => 4],
                    ['color' => 'سیلور', 'size' => null, 'price' => 210000, 'stock' => 4],
                ]
            ],
            [
                'name' => 'گردنی حروف',
                'category' => 'اکسسوری',
                'price' => 190000,
                'stock' => 0,
                'description' => 'گردنی حروف تمام استیل رنگ ثابت',
                'variants' => [
                    ['color' => 'سیلور', 'size' => null, 'price' => 190000, 'stock' => 4],
                ]
            ],
            [
                'name' => 'گردنی ستاره‌ای بیلیارد',
                'category' => 'اکسسوری',
                'price' => 240000,
                'stock' => 0,
                'description' => 'گردنی بیلیارد و ستاره تمام استیل رنگ ثابت',
                'variants' => [
                    ['color' => 'قرمز', 'size' => null, 'price' => 240000, 'stock' => 3],
                    ['color' => 'مشکی', 'size' => null, 'price' => 240000, 'stock' => 3],
                ]
            ],
            [
                'name' => 'کمربند',
                'category' => 'اکسسوری',
                'price' => 890000,
                'stock' => 2,
                'description' => 'کمربند خاص پینترستی که هم حالت چاقو داره هم حالت کمربند دو کارست',
                'variants' => []
            ],
            [
                'name' => 'کمربند فندکی',
                'category' => 'اکسسوری',
                'price' => 890000,
                'stock' => 0,
                'description' => 'کمربند فندکی که میشه هم فندک استفاده کرد هم کمربند خیلی خاص وترند',
                'variants' => []
            ],
            [
                'name' => 'گردنبند پرچم ترکیه',
                'category' => 'اکسسوری',
                'price' => 220000,
                'stock' => 3,
                'description' => 'گردنی تمام استیل رنگ ثابت',
                'variants' => []
            ],
            [
                'name' => 'چارم BMW',
                'category' => 'اکسسوری',
                'price' => 490000,
                'stock' => 5,
                'description' => 'چارم طرح bmw رنگ ثابت حالت کشی دارن و چارم هاشون قابل تعقیر دملاشون و هم سایزشون',
                'variants' => []
            ],
            [
                'name' => 'چارم بارسا',
                'category' => 'اکسسوری',
                'price' => 490000,
                'stock' => 5,
                'description' => 'تمام استیل رنگ ثابت',
                'variants' => []
            ],
            [
                'name' => 'چارم رئال',
                'category' => 'اکسسوری',
                'price' => 490000,
                'stock' => 5,
                'description' => 'چارم رئال مادرید',
                'variants' => []
            ],
            [
                'name' => 'بنگل النگو',
                'category' => 'اکسسوری',
                'price' => 480000,
                'stock' => 2,
                'description' => 'بنگل النگویی میناکاری قفلی بسیار شیک و ترند',
                'variants' => []
            ],
            [
                'name' => 'دستبند ستاره‌ای',
                'category' => 'اکسسوری',
                'price' => 240000,
                'stock' => 3,
                'description' => 'دستبند ستاره‌ای فوق العاده زیبا خاص',
                'variants' => []
            ],
            [
                'name' => 'گردنبند شیروخورشید',
                'category' => 'اکسسوری',
                'price' => 380000,
                'stock' => 0,
                'description' => 'گردنبند شیروخورشید',
                'variants' => [
                    ['color' => 'برنجی', 'size' => null, 'price' => 380000, 'stock' => 5],
                ]
            ],
            [
                'name' => 'گردنبند ماری',
                'category' => 'اکسسوری',
                'price' => 190000,
                'stock' => 0,
                'description' => 'گردنبند ماری. رنگ ثابت سه میل',
                'variants' => [
                    ['color' => 'گلد', 'size' => null, 'price' => 210000, 'stock' => 5],
                ]
            ],
            [
                'name' => 'کفش نایک جردن',
                'category' => 'کفش',
                'price' => 4300000,
                'stock' => 0,
                'description' => 'نایک جردن ویتنام بسیار راحت و شیک با ضمانت کامل',
                'variants' => [
                    ['color' => 'مشکی', 'size' => '37', 'price' => 4300000, 'stock' => 6],
                    ['color' => 'مشکی', 'size' => '38', 'price' => 4300000, 'stock' => 6],
                    ['color' => 'مشکی', 'size' => '39', 'price' => 4300000, 'stock' => 6],
                    ['color' => 'مشکی', 'size' => '40', 'price' => 4300000, 'stock' => 6],
                ]
            ],
            [
                'name' => 'شلوار چری',
                'category' => 'شلوار',
                'price' => 1380000,
                'stock' => 0,
                'description' => 'شلوار چری ترند پاییز',
                'variants' => [
                    ['color' => 'چری', 'size' => '29', 'price' => 1380000, 'stock' => 6],
                    ['color' => 'چری', 'size' => '30', 'price' => 1380000, 'stock' => 6],
                    ['color' => 'چری', 'size' => '31', 'price' => 1380000, 'stock' => 6],
                    ['color' => 'چری', 'size' => '32', 'price' => 1380000, 'stock' => 6],
                    ['color' => 'چری', 'size' => '33', 'price' => 1380000, 'stock' => 6],
                ]
            ],
        ];

        foreach ($products as $productData) {
            // Create product
            $product = Product::create([
                'title' => $productData['name'],
                'slug' => Str::slug($productData['name']),
                'description' => $productData['description'],
                'price' => $productData['price'],
                'stock' => $productData['stock'],
                'category_id' => $this->getCategoryId($productData['category']),
                'is_active' => true,
                'has_variants' => !empty($productData['variants']),
                'has_colors' => $this->hasColors($productData['variants']),
                'has_sizes' => $this->hasSizes($productData['variants']),
            ]);

            // Create variants
            foreach ($productData['variants'] as $variantData) {
                $variant = [
                    'product_id' => $product->id,
                    'stock' => $variantData['stock'],
                    'price' => $variantData['price'] ?? $product->price,
                    'is_active' => true,
                ];

                if ($variantData['color']) {
                    $variant['color_id'] = $colorModels[$variantData['color']]->id;
                }

                if ($variantData['size']) {
                    $variant['size_id'] = $sizeModels[$variantData['size']]->id;
                }

                ProductVariant::create($variant);
            }
        }

        $this->command->info('Production data seeded successfully!');
    }

    private function getCategoryId($categoryName)
    {
        return Category::where('name', $categoryName)->first()->id;
    }

    private function hasColors($variants)
    {
        foreach ($variants as $variant) {
            if (!empty($variant['color'])) {
                return true;
            }
        }
        return false;
    }

    private function hasSizes($variants)
    {
        foreach ($variants as $variant) {
            if (!empty($variant['size'])) {
                return true;
            }
        }
        return false;
    }
}
