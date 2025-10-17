<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $searchQuery = $request->input('q');
        $page = $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 12);
        $categoryId = $request->input('category_id');
        $sort = $request->input('sort'); // 'random' | 'latest'

        $query = Product::query()
            ->with(['images', 'campaigns' => function ($query) {
                $query->where('is_active', true)
                      ->where('starts_at', '<=', now())
                      ->where('ends_at', '>=', now())
                      ->orderBy('priority', 'desc');
            }])
            ->when($searchQuery, function ($queryBuilder) use ($searchQuery) {
                $queryBuilder->where(function ($q2) use ($searchQuery) {
                    $q2->where('title', 'like', "%{$searchQuery}%")
                       ->orWhere('description', 'like', "%{$searchQuery}%");
                });
            })
            ->when($categoryId, function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->where('is_active', true)
            ->when($sort === 'random', function ($q) {
                $q->inRandomOrder();
            }, function ($q) {
                $q->latest();
            });

        $products = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'has_more_pages' => $products->hasMorePages(),
            ]
        ]);
    }

    public function show(Product $product)
    {
        $product->load(['images', 'activeVariants.color', 'activeVariants.size', 'campaigns']);
        
        // Add available_colors and available_sizes attributes
        $product->setAppends(['available_colors', 'available_sizes', 'total_stock']);
        
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function search(Request $request)
    {
        $searchQuery = $request->input('q');
        $page = $request->input('page', 1);
        $perPage = 12;

        $products = Product::query()
            ->with(['images', 'campaigns' => function ($query) {
                $query->where('is_active', true)
                      ->where('starts_at', '<=', now())
                      ->where('ends_at', '>=', now())
                      ->orderBy('priority', 'desc');
            }])
            ->when($searchQuery, function ($queryBuilder) use ($searchQuery) {
                $queryBuilder->where(function ($q2) use ($searchQuery) {
                    $q2->where('title', 'like', "%{$searchQuery}%")
                       ->orWhere('description', 'like', "%{$searchQuery}%");
                });
            })
            ->where('is_active', true)
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'has_more_pages' => $products->hasMorePages(),
            ]
        ]);
    }
}
