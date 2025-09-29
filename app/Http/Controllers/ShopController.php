<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Contracts\View\View;

class ShopController extends Controller
{
    public function index()
    {
        $q = request('q');
        $products = Product::query()
            ->with('images')
            ->when($q, function ($query) use ($q) {
                $query->where(function ($q2) use ($q) {
                    $q2->where('title', 'like', "%{$q}%")
                       ->orWhere('description', 'like', "%{$q}%");
                });
            })
            ->where('is_active', true)
            ->latest()
            ->paginate(12)
            ->withQueryString();
        return view('shop.index', compact('products'));
    }

    public function show(Product $product): View
    {
        $product->load('images');
        return view('shop.show', compact('product'));
    }
}


