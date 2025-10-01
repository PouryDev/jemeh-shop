<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductImage;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create or update default admin and sample user
        User::updateOrCreate(
            ['phone' => '09123456789'],
            [
                'name' => 'Admin', 
                'instagram_id' => '@admin',
                'password' => bcrypt('password'), 
                'is_admin' => true
            ]
        );

        User::updateOrCreate(
            ['phone' => '09123456790'],
            [
                'name' => 'Test User',
                'instagram_id' => '@testuser', 
                'password' => bcrypt('password')
            ]
        );

        // Seed many products with sample images
        Product::factory(40)->create()->each(function (Product $product) {
            // attach 1-3 placeholder images
            $count = rand(1, 3);
            for ($i = 0; $i < $count; $i++) {
                $placeholder = 'https://picsum.photos/seed/'.md5($product->id.'-'.$i).'/600/600';
                // store as external url in path for demo, or keep empty for now
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $placeholder,
                    'sort_order' => $i,
                ]);
            }
        });
    }
}
