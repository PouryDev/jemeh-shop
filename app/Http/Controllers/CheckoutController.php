<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\DiscountCodeService;
use App\Services\CampaignService;
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
        
        // Handle discount code validation
        $discountCode = null;
        $discountAmount = 0;
        $discountCodeError = null;
        
        if ($request->has('discount_code') && $request->filled('discount_code')) {
            if ($request->user()) {
                $discountService = new DiscountCodeService();
                $result = $discountService->validateDiscountCode(
                    $request->input('discount_code'),
                    $request->user(),
                    $total
                );
                
                if ($result['success']) {
                    $discountCode = $result['discount_code'];
                    $discountAmount = $result['discount_amount'];
                } else {
                    $discountCodeError = $result['message'];
                }
            } else {
                $discountCodeError = 'برای استفاده از کد تخفیف باید وارد حساب کاربری خود شوید.';
            }
        }
        
        $finalAmount = $total - $discountAmount;
        
        return view('shop.checkout', compact(
            'cart', 
            'products', 
            'total', 
            'discountCode', 
            'discountAmount', 
            'finalAmount',
            'discountCodeError'
        ));
    }

    public function place(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_address' => 'required|string|max:1000',
            'receipt' => 'nullable|image|max:4096',
            'discount_code' => 'nullable|string|max:50',
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

        // Handle discount code
        $discountAmount = 0;
        $discountCode = null;
        if (!empty($data['discount_code']) && $request->user()) {
            $discountService = new DiscountCodeService();
            $result = $discountService->applyDiscountCode(
                $data['discount_code'],
                $request->user(),
                $total
            );
            
            if ($result['success']) {
                $discountAmount = $result['discount_amount'];
                $discountCode = $result['discount_code'];
            } else {
                return back()->withErrors(['discount_code' => $result['message']]);
            }
        }

        $finalAmount = $total - $discountAmount;

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
            'discount_code' => $data['discount_code'],
            'discount_amount' => $discountAmount,
            'final_amount' => $finalAmount,
            'status' => 'pending',
            'receipt_path' => $receiptPath,
        ]);

        foreach ($cart as $cartKey => $qty) {
            // Parse cart key to get product ID and variant info
            $parts = explode('_', $cartKey);
            $productId = $parts[0];
            $colorId = isset($parts[1]) && $parts[1] !== '0' ? $parts[1] : null;
            $sizeId = isset($parts[2]) && $parts[2] !== '0' ? $parts[2] : null;
            
            $product = $products[$productId];
            
            // Find the variant if color/size is specified
            $productVariant = null;
            $variantDisplayName = null;
            $unitPrice = $product->price;
            
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
                    $unitPrice = $productVariant->price ?? $product->price;
                    $variantDisplayName = $productVariant->display_name;
                }
            }
            
            // Apply campaign discount
            $campaignService = new CampaignService();
            $originalPrice = $unitPrice;
            $campaignDiscountAmount = 0;
            $campaignId = null;
            
            if ($productVariant) {
                $campaignData = $campaignService->calculateVariantPrice($productVariant);
            } else {
                $campaignData = $campaignService->calculateProductPrice($product);
            }
            
            if ($campaignData['has_discount']) {
                $unitPrice = $campaignData['campaign_price'];
                $campaignDiscountAmount = $campaignData['discount_amount'];
                $campaignId = $campaignData['campaign']->id;
            }
            
            $orderItem = OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_variant_id' => $productVariant?->id,
                'color_id' => $colorId,
                'size_id' => $sizeId,
                'variant_display_name' => $variantDisplayName,
                'campaign_id' => $campaignId,
                'original_price' => $originalPrice,
                'campaign_discount_amount' => $campaignDiscountAmount,
                'unit_price' => $unitPrice,
                'quantity' => $qty,
                'line_total' => $unitPrice * $qty,
            ]);
            
            // Record campaign sale if applicable
            if ($campaignId) {
                $campaignService->recordCampaignSale($orderItem);
            }
        }

        // Apply discount code if provided
        if ($discountCode) {
            $discountService = new DiscountCodeService();
            $discountService->applyDiscountToOrder($order, $discountCode, $discountAmount);
        }

        $invoice = Invoice::create([
            'order_id' => $order->id,
            'invoice_number' => 'INV-'.Str::upper(Str::random(8)),
            'amount' => $finalAmount,
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


