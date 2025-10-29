<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Campaign;
use App\Services\Telegram\Client as TelegramClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.product.images', 'items.productVariants'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_address' => 'required|string|max:500',
            'discount_code' => 'nullable|string|exists:discount_codes,code'
        ]);

        // Create order logic here
        // This would be similar to your existing CheckoutController

        return response()->json([
            'success' => true,
            'message' => 'سفارش با موفقیت ثبت شد'
        ]);
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_address' => 'required|string|max:500',
            'delivery_method_id' => 'required|exists:delivery_methods,id',
            'discount_code' => 'nullable|string|exists:discount_codes,code'
        ]);

        // Get cart from session
        $cart = $request->session()->get('cart', []);
        
        if (empty($cart)) {
            return response()->json([
                'success' => false,
                'message' => 'سبد خرید خالی است'
            ], 400);
        }

        // Calculate totals and prepare order items
        $itemsPayload = [];
        $totalAmount = 0;

        foreach ($cart as $key => $item) {
            $product = Product::with(['campaigns' => function ($query) {
                $query->where('is_active', true)
                      ->where('starts_at', '<=', now())
                      ->where('ends_at', '>=', now())
                      ->orderBy('priority', 'desc');
            }])->find($item['product_id'] ?? null);
            if (!$product) {
                continue;
            }
            $quantity = (int) ($item['quantity'] ?? 0);
            if ($quantity <= 0) { continue; }

            // Get variant price if applicable
            $unitPrice = (int) $product->price;
            if ($item['color_id'] || $item['size_id']) {
                $variant = ProductVariant::where('product_id', $product->id)
                    ->when($item['color_id'], function ($query) use ($item) {
                        $query->where('color_id', $item['color_id']);
                    })
                    ->when($item['size_id'], function ($query) use ($item) {
                        $query->where('size_id', $item['size_id']);
                    })
                    ->first();
                    
                if ($variant) {
                    $unitPrice = $variant->price ?? $product->price;
                }
            }

            // Calculate campaign discount
            $discountAmount = 0;
            $finalPrice = $unitPrice;
            if ($product->campaigns && $product->campaigns->count() > 0) {
                $campaign = $product->campaigns->first();
                $discountAmount = $campaign->calculateDiscount($unitPrice);
                $finalPrice = $unitPrice - $discountAmount;
            }

            $lineTotal = $finalPrice * $quantity;
            $totalAmount += $lineTotal;

            $itemsPayload[] = [
                'product_id' => $product->id,
                'unit_price' => $finalPrice,
                'original_price' => $unitPrice,
                'discount_amount' => $discountAmount,
                'quantity' => $quantity,
                'line_total' => $lineTotal,
                'cart_key' => $key,
                'color_id' => $item['color_id'] ?? null,
                'size_id' => $item['size_id'] ?? null,
            ];
        }

        if ($totalAmount <= 0 || count($itemsPayload) === 0) {
            return response()->json([
                'success' => false,
                'message' => 'سبد خرید نامعتبر است'
            ], 400);
        }

        // Optionally add delivery fee to invoice amount only (orders table has no delivery fee column)
        $deliveryFee = 0;
        // If needed, you could fetch and add delivery fee here based on delivery_method_id

        // Handle receipt upload
        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('receipts', 'public');
        }

        // Persist order, items and invoice in a transaction
        $order = DB::transaction(function () use ($request, $itemsPayload, $totalAmount, $receiptPath, $deliveryFee, $cart) {
            $order = new Order();
            $order->user_id = optional($request->user())->id;
            $order->customer_name = $request->input('customer_name');
            $order->customer_phone = $request->input('customer_phone');
            $order->customer_address = $request->input('customer_address');
            $order->total_amount = $totalAmount;
            $order->status = 'pending';
            if ($receiptPath) {
                $order->receipt_path = $receiptPath;
            }
            $order->save();

            // Items and stock reduction
            foreach ($itemsPayload as $row) {
                $orderItem = $order->items()->create($row);
                
                // Reduce stock based on variant selection
                $cartItem = $cart[$row['cart_key']] ?? null;
                if ($cartItem) {
                    $product = Product::find($row['product_id']);
                    $quantity = $row['quantity'];
                    
                    if ($cartItem['color_id'] || $cartItem['size_id']) {
                        // Find and reduce variant stock
                        $variant = ProductVariant::where('product_id', $product->id)
                            ->when($cartItem['color_id'], function ($query) use ($cartItem) {
                                $query->where('color_id', $cartItem['color_id']);
                            })
                            ->when($cartItem['size_id'], function ($query) use ($cartItem) {
                                $query->where('size_id', $cartItem['size_id']);
                            })
                            ->first();
                            
                        if ($variant) {
                            $variant->decrement('stock', $quantity);
                        }
                    } else {
                        // Reduce main product stock
                        $product->decrement('stock', $quantity);
                    }
                }
            }

            // Invoice
            $invoice = new Invoice();
            $invoice->order_id = $order->id;
            $invoice->invoice_number = 'INV-' . Str::upper(Str::random(8));
            $invoice->amount = $totalAmount + $deliveryFee;
            $invoice->status = 'unpaid';
            $invoice->save();

            // Attach for response
            $order->setRelation('invoice', $invoice);

            return $order;
        });

        // Send Telegram notification to admins
        $this->sendOrderNotification($order);

        // Clear cart after successful order creation
        $request->session()->forget('cart');

        return response()->json([
            'success' => true,
            'message' => 'سفارش با موفقیت ثبت شد',
            'order' => [
                'id' => $order->id,
            ],
            'invoice' => [
                'id' => $order->invoice->id,
                'invoice_number' => $order->invoice->invoice_number,
                'amount' => $order->invoice->amount,
                'status' => $order->invoice->status,
            ]
        ]);
    }

    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $order->load(['items.product', 'items.variant', 'invoice', 'transactions']);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Send Telegram notification when a new order is created
     */
    private function sendOrderNotification(Order $order): void
    {
        $adminChatId = config('telegram.admin_chat_id');
        
        if (!$adminChatId) {
            logger()->warning('[TELEGRAM] Admin chat ID not configured, skipping notification');
            return;
        }

        try {
            // Load order relationships for message formatting
            $order->load(['items.product', 'invoice']);
            
            // Format message in Persian
            $itemsCount = $order->items->count();
            $totalAmount = number_format($order->total_amount) . ' تومان';
            $invoiceNumber = $order->invoice->invoice_number ?? 'N/A';
            
            $message = "🛒 سفارش جدید ثبت شد\n\n";
            $message .= "📋 شماره سفارش: #{$order->id}\n";
            $message .= "🧾 شماره فاکتور: {$invoiceNumber}\n";
            $message .= "👤 نام مشتری: {$order->customer_name}\n";
            $message .= "📞 تلفن: {$order->customer_phone}\n";
            $message .= "📍 آدرس: {$order->customer_address}\n";
            $message .= "📦 تعداد اقلام: {$itemsCount}\n";
            $message .= "💰 مبلغ کل: {$totalAmount}\n";
            $message .= "📊 وضعیت: " . $this->getStatusLabel($order->status) . "\n";
            
            if ($order->receipt_path) {
                $message .= "📎 فایل رسید: دارد\n";
            }

            $telegramClient = new TelegramClient();
            $telegramClient->sendMessage((int) $adminChatId, $message);
        } catch (\Exception $e) {
            // Log error but don't fail order creation
            logger()->error('[OrderController][sendOrderNotification][TELEGRAM] Failed to send order notification', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get Persian label for order status
     */
    private function getStatusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'در انتظار',
            'confirmed' => 'تایید شده',
            'shipped' => 'ارسال شده',
            'cancelled' => 'لغو شده',
            default => $status,
        };
    }
}
