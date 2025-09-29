<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->string('status')->toString();
        $q = $request->string('q')->toString();

        $orders = Order::query()
            ->with('invoice')
            ->when($status, function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($q, function ($query) use ($q) {
                $query->where(function ($q2) use ($q) {
                    $q2->where('customer_name', 'like', "%{$q}%")
                        ->orWhere('customer_phone', 'like', "%{$q}%")
                        ->orWhere('id', $q);
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return view('admin.orders.index', compact('orders', 'status', 'q'));
    }

    public function show(Order $order)
    {
        $order->load('items.product', 'invoice.transactions');
        return view('admin.orders.show', compact('order'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,shipped',
        ]);
        $order->update(['status' => $data['status']]);
        return back();
    }

    public function verifyTransaction(Request $request, Order $order)
    {
        $invoice = $order->invoice;
        if (!$invoice) {
            return back();
        }
        $transactionId = $request->integer('transaction_id');
        $transaction = Transaction::where('invoice_id', $invoice->id)->where('id', $transactionId)->firstOrFail();
        $transaction->update([
            'status' => 'verified',
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
        ]);
        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);
        $order->update(['status' => 'confirmed']);
        return back();
    }
}


