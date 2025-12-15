<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Category;
use App\Models\Campaign;
use App\Models\DiscountCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $merchant = Merchant::current();
        $merchantId = $merchant?->id;

        // Calculate total customers for this merchant
        // Customers are users who have at least one order or address for this merchant
        $totalCustomers = 0;
        if ($merchantId) {
            $totalCustomers = User::where('is_admin', false)
                ->where(function ($query) use ($merchantId) {
                    $query->whereHas('orders', function ($q) use ($merchantId) {
                        $q->where('merchant_id', $merchantId);
                    })
                    ->orWhereHas('addresses', function ($q) use ($merchantId) {
                        $q->where('merchant_id', $merchantId);
                    });
                })
                ->distinct()
                ->count();
        } else {
            // If no merchant, count all non-admin users
            $totalCustomers = User::where('is_admin', false)->count();
        }

        // Basic stats
        $stats = [
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'total_revenue' => Order::where('status', 'delivered')->sum('final_amount'),
            'total_customers' => $totalCustomers,
            'total_categories' => Category::where('is_active', true)->count(),
            'active_campaigns' => Campaign::where('is_active', true)->count(),
            'active_discount_codes' => DiscountCode::where('is_active', true)->count(),
        ];

        // Recent orders
        $recentOrders = Order::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->customer_name,
                    'total_amount' => $order->final_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at->format('Y-m-d H:i'),
                    'items_count' => $order->items->count()
                ];
            });

        // Top selling products
        $topProductsQuery = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.id', 'products.title', DB::raw('SUM(order_items.quantity) as total_sold'));
        
        if ($merchantId) {
            $topProductsQuery->where('orders.merchant_id', $merchantId)
                ->where('products.merchant_id', $merchantId);
        }
        
        $topProducts = $topProductsQuery
            ->groupBy('products.id', 'products.title')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();

        // Revenue by month (last 6 months)
        $revenueByMonth = Order::where('status', 'delivered')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(final_amount) as revenue')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Orders by status
        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_orders' => $recentOrders,
                'top_products' => $topProducts,
                'revenue_by_month' => $revenueByMonth,
                'orders_by_status' => $ordersByStatus
            ]
        ]);
    }
}