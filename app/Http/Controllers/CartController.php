<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = $request->session()->get('cart', []);
        return view('shop.cart', compact('cart'));
    }

    public function add(Request $request, Product $product)
    {
        $quantity = max(1, (int) $request->integer('quantity', 1));
        $colorId = $request->input('color_id');
        $sizeId = $request->input('size_id');
        
        // Create cart key based on product and variant
        $cartKey = $product->id;
        if ($colorId || $sizeId) {
            $cartKey .= '_' . ($colorId ?: '0') . '_' . ($sizeId ?: '0');
        }
        
        $cart = $request->session()->get('cart', []);
        $cart[$cartKey] = ($cart[$cartKey] ?? 0) + $quantity;
        $request->session()->put('cart', $cart);
        
        if ($request->expectsJson()) {
            return response()->json($this->buildCartPayload($request));
        }
        return redirect()->route('cart.index');
    }

    public function remove(Request $request, $cartKey)
    {
        $cart = $request->session()->get('cart', []);
        unset($cart[$cartKey]);
        $request->session()->put('cart', $cart);
        if ($request->expectsJson()) {
            return response()->json($this->buildCartPayload($request));
        }
        return redirect()->route('cart.index');
    }

    private function buildCartPayload(Request $request): array
    {
        $cart = $request->session()->get('cart', []);
        $count = array_sum($cart);
        $items = [];
        
        foreach ($cart as $cartKey => $qty) {
            // Parse cart key to get product ID and variant info
            $parts = explode('_', $cartKey);
            $productId = $parts[0];
            $colorId = isset($parts[1]) && $parts[1] !== '0' ? $parts[1] : null;
            $sizeId = isset($parts[2]) && $parts[2] !== '0' ? $parts[2] : null;
            
            $product = Product::find($productId);
            if ($product) {
                $variantDisplayName = null;
                $unitPrice = $product->price;
                
                // Find variant info if exists
                if ($colorId || $sizeId) {
                    $productVariant = ProductVariant::where('product_id', $productId)
                        ->when($colorId, function ($query) use ($colorId) {
                            $query->where('color_id', $colorId);
                        })
                        ->when($sizeId, function ($query) use ($sizeId) {
                            $query->where('size_id', $sizeId);
                        })
                        ->first();
                    
                    if ($productVariant) {
                        $variantDisplayName = $productVariant->display_name;
                        $unitPrice = $productVariant->price ?? $product->price;
                    }
                }
                
                $items[] = [
                    'cart_key' => $cartKey,
                    'id' => $product->id,
                    'slug' => $product->slug,
                    'title' => $product->title,
                    'variant_display_name' => $variantDisplayName,
                    'price' => $unitPrice,
                    'quantity' => $qty,
                    'total' => $unitPrice * $qty,
                ];
            }
        }
        
        $total = array_sum(array_column($items, 'total'));
        return ['ok' => true, 'count' => $count, 'items' => $items, 'total' => $total];
    }

    public function summary(Request $request)
    {
        return response()->json($this->buildCartPayload($request));
    }
}


