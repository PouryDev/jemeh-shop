<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Color;
use App\Models\Size;
use App\Services\PlanService;
use App\Services\UsageTrackingService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Stancl\Tenancy\Facades\Tenancy;

class AdminProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['images', 'variants.color', 'variants.size', 'category'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['images', 'variants.color', 'variants.size', 'category'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function store(Request $request)
    {
        // Check plan limits if in tenant context
        if (Tenancy::initialized()) {
            $tenant = Tenancy::tenant();
            $planService = new PlanService();
            $check = $planService->canCreateProduct($tenant);
            
            if (!$check['allowed']) {
                return response()->json([
                    'success' => false,
                    'message' => $check['message'],
                    'limit_reached' => true,
                    'current' => $check['current'] ?? null,
                    'limit' => $check['limit'] ?? null,
                ], 403);
            }
        }

        $data = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'has_variants' => 'boolean',
            'has_colors' => 'boolean',
            'has_sizes' => 'boolean',
            'is_active' => 'sometimes|boolean',
            'images.*' => 'sometimes|image|max:4096',
            'variants.*.color_id' => 'nullable|exists:colors,id',
            'variants.*.color_name' => 'nullable|string|max:255',
            'variants.*.color_hex_code' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'variants.*.size_id' => 'nullable|exists:sizes,id',
            'variants.*.size_name' => 'nullable|string|max:255',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
        ]);

        $data['slug'] = Str::slug($data['title']) . '-' . Str::random(4);
        
        // Convert string values to proper types for FormData
        $data['has_variants'] = $request->boolean('has_variants');
        $data['has_colors'] = $request->boolean('has_colors');
        $data['has_sizes'] = $request->boolean('has_sizes');
        $data['is_active'] = $request->boolean('is_active');
        $data['price'] = (float) $data['price'];
        $data['stock'] = (int) $data['stock'];
        
        $product = Product::create($data);

        // Track storage usage for images
        $usageTrackingService = new UsageTrackingService();
        $planService = new PlanService();
        
        if ($request->hasFile('images') && Tenancy::initialized()) {
            $tenant = Tenancy::tenant();
            foreach ($request->file('images') as $file) {
                $fileSize = $file->getSize();
                $check = $planService->canUploadFile($tenant, $fileSize);
                
                if (!$check['allowed']) {
                    // Delete the product if storage limit reached
                    $product->delete();
                    return response()->json([
                        'success' => false,
                        'message' => $check['message'],
                        'limit_reached' => true,
                    ], 403);
                }
            }
        }

        // Handle images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('products', 'public');
                $product->images()->create([
                    'path' => $path,
                    'sort_order' => $index,
                ]);
                
                // Track storage usage
                if (Tenancy::initialized()) {
                    $tenant = Tenancy::tenant();
                    $usageTrackingService->addStorageUsage($tenant, $file->getSize());
                }
            }
        }

        // Update product count
        if (Tenancy::initialized()) {
            $tenant = Tenancy::tenant();
            $usageTrackingService->updateProductCount($tenant);
        }

        // Handle variants
        if ($request->has('variants')) {
            foreach ($request->input('variants') as $variantData) {
                $variantDataToSave = [];
                
                // Process color
                if (!empty($variantData['color_id'])) {
                    $variantDataToSave['color_id'] = $variantData['color_id'];
                } elseif (!empty($variantData['color_name'])) {
                    $colorName = trim($variantData['color_name']);
                    $color = Color::firstOrCreate(
                        ['name' => $colorName],
                        [
                            'hex_code' => $variantData['color_hex_code'] ?? null,
                            'is_active' => true
                        ]
                    );
                    
                    // Update hex_code if provided and different
                    if (!empty($variantData['color_hex_code']) && $color->hex_code !== $variantData['color_hex_code']) {
                        $color->hex_code = $variantData['color_hex_code'];
                        $color->save();
                    }
                    
                    $variantDataToSave['color_id'] = $color->id;
                }
                
                // Process size
                if (!empty($variantData['size_id'])) {
                    $variantDataToSave['size_id'] = $variantData['size_id'];
                } elseif (!empty($variantData['size_name'])) {
                    $sizeName = trim($variantData['size_name']);
                    $size = Size::firstOrCreate(
                        ['name' => $sizeName],
                        ['is_active' => true]
                    );
                    $variantDataToSave['size_id'] = $size->id;
                }
                
                // Add other fields
                $variantDataToSave['price'] = $variantData['price'] ?? null;
                $variantDataToSave['stock'] = $variantData['stock'] ?? 0;
                
                $product->variants()->create($variantDataToSave);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $product->load(['images', 'variants.color', 'variants.size', 'category'])
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'has_variants' => 'boolean',
            'has_colors' => 'boolean',
            'has_sizes' => 'boolean',
            'is_active' => 'sometimes|boolean',
            'images.*' => 'sometimes|image|max:4096',
            'existing_images.*' => 'sometimes|integer|exists:product_images,id',
            'variants.*.color_id' => 'nullable|exists:colors,id',
            'variants.*.color_name' => 'nullable|string|max:255',
            'variants.*.color_hex_code' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'variants.*.size_id' => 'nullable|exists:sizes,id',
            'variants.*.size_name' => 'nullable|string|max:255',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
        ]);

        // Convert string values to proper types for FormData
        $data['has_variants'] = $request->boolean('has_variants');
        $data['has_colors'] = $request->boolean('has_colors');
        $data['has_sizes'] = $request->boolean('has_sizes');
        $data['is_active'] = $request->boolean('is_active');
        $data['price'] = (float) $data['price'];
        $data['stock'] = (int) $data['stock'];
        
        $product->update($data);

        // Handle images
        // First, delete all existing images that are not in the keep list
        $keepImageIds = $request->input('existing_images', []);
        $product->images()->whereNotIn('id', $keepImageIds)->delete();

        // Add new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('products', 'public');
                $product->images()->create([
                    'path' => $path,
                    'sort_order' => $index,
                ]);
            }
        }

        // Handle variants
        if ($request->has('variants')) {
            $product->variants()->delete();
            foreach ($request->input('variants') as $variantData) {
                $variantDataToSave = [];
                
                // Process color
                if (!empty($variantData['color_id'])) {
                    $variantDataToSave['color_id'] = $variantData['color_id'];
                } elseif (!empty($variantData['color_name'])) {
                    $colorName = trim($variantData['color_name']);
                    $color = Color::firstOrCreate(
                        ['name' => $colorName],
                        [
                            'hex_code' => $variantData['color_hex_code'] ?? null,
                            'is_active' => true
                        ]
                    );
                    
                    // Update hex_code if provided and different
                    if (!empty($variantData['color_hex_code']) && $color->hex_code !== $variantData['color_hex_code']) {
                        $color->hex_code = $variantData['color_hex_code'];
                        $color->save();
                    }
                    
                    $variantDataToSave['color_id'] = $color->id;
                }
                
                // Process size
                if (!empty($variantData['size_id'])) {
                    $variantDataToSave['size_id'] = $variantData['size_id'];
                } elseif (!empty($variantData['size_name'])) {
                    $sizeName = trim($variantData['size_name']);
                    $size = Size::firstOrCreate(
                        ['name' => $sizeName],
                        ['is_active' => true]
                    );
                    $variantDataToSave['size_id'] = $size->id;
                }
                
                // Add other fields
                $variantDataToSave['price'] = $variantData['price'] ?? null;
                $variantDataToSave['stock'] = $variantData['stock'] ?? 0;
                
                $product->variants()->create($variantDataToSave);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $product->load(['images', 'variants.color', 'variants.size', 'category'])
        ]);
    }

    public function destroyImage($productId, $imageId)
    {
        $product = Product::findOrFail($productId);
        $image = $product->images()->findOrFail($imageId);

        // Track storage usage removal
        $usageTrackingService = new UsageTrackingService();
        if (Tenancy::initialized()) {
            $tenant = Tenancy::tenant();
            if (!str_starts_with($image->path, 'http')) {
                $filePath = storage_path('app/public/' . $image->path);
                if (file_exists($filePath)) {
                    $fileSize = filesize($filePath);
                    $usageTrackingService->removeStorageUsage($tenant, $fileSize);
                    unlink($filePath);
                }
            }
        } else {
            // Delete from disk if it's a local file
            if (!str_starts_with($image->path, 'http')) {
                $filePath = storage_path('app/public/' . $image->path);
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
        }

        // Delete from database
        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'تصویر با موفقیت حذف شد'
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        
        // Track storage usage removal for images
        $usageTrackingService = new UsageTrackingService();
        if (Tenancy::initialized()) {
            $tenant = Tenancy::tenant();
            foreach ($product->images as $image) {
                if (!str_starts_with($image->path, 'http')) {
                    $filePath = storage_path('app/public/' . $image->path);
                    if (file_exists($filePath)) {
                        $fileSize = filesize($filePath);
                        $usageTrackingService->removeStorageUsage($tenant, $fileSize);
                    }
                }
            }
            // Update product count
            $usageTrackingService->updateProductCount($tenant);
        }
        
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'محصول با موفقیت حذف شد'
        ]);
    }
}