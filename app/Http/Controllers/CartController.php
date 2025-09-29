<?php

namespace App\Http\Controllers;

use App\Models\Product;
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
        $cart = $request->session()->get('cart', []);
        $cart[$product->id] = ($cart[$product->id] ?? 0) + $quantity;
        $request->session()->put('cart', $cart);
        if ($request->expectsJson()) {
            return response()->json($this->buildCartPayload($request));
        }
        return redirect()->route('cart.index');
    }

    public function remove(Request $request, Product $product)
    {
        $cart = $request->session()->get('cart', []);
        unset($cart[$product->id]);
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
        $ids = array_keys($cart);
        $items = [];
        if (!empty($ids)) {
            $products = Product::whereIn('id', $ids)->get()->keyBy('id');
            foreach ($cart as $id => $qty) {
                $p = $products[$id] ?? null;
                if ($p) {
                    $items[] = [
                        'id' => $p->id,
                        'title' => $p->title,
                        'price' => $p->price,
                        'quantity' => $qty,
                        'total' => $p->price * $qty,
                    ];
                }
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


