<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        $cart = $request->session()->get('cart', []);
        $products = Product::query()->whereIn('id', array_keys($cart))->get()->keyBy('id');
        $total = 0;
        foreach ($cart as $productId => $qty) {
            $total += ($products[$productId]->price ?? 0) * $qty;
        }
        return view('shop.checkout', compact('cart', 'products', 'total'));
    }

    public function place(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_address' => 'required|string|max:1000',
            'receipt' => 'nullable|image|max:4096',
        ]);

        $cart = $request->session()->get('cart', []);
        if (empty($cart)) {
            return redirect()->route('shop.index');
        }

        $products = Product::query()->whereIn('id', array_keys($cart))->get()->keyBy('id');
        $total = 0;
        foreach ($cart as $productId => $qty) {
            $total += ($products[$productId]->price ?? 0) * $qty;
        }

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('receipts', 'public');
        }

        $order = Order::create([
            'user_id' => $request->user() ? $request->user()->id : null,
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'customer_address' => $data['customer_address'],
            'total_amount' => $total,
            'status' => 'pending',
            'receipt_path' => $receiptPath,
        ]);

        foreach ($cart as $productId => $qty) {
            $product = $products[$productId];
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'unit_price' => $product->price,
                'quantity' => $qty,
                'line_total' => $product->price * $qty,
            ]);
        }

        $invoice = Invoice::create([
            'order_id' => $order->id,
            'invoice_number' => 'INV-'.Str::upper(Str::random(8)),
            'amount' => $total,
            'currency' => 'IRR',
            'status' => 'unpaid',
        ]);

        $request->session()->forget('cart');
        return redirect()->route('checkout.thanks', $invoice);
    }

    public function thanks(Invoice $invoice)
    {
        return view('shop.thanks', compact('invoice'));
    }
}


