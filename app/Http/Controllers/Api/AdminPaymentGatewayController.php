<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\PaymentGateway;
use Illuminate\Http\Request;

class AdminPaymentGatewayController extends Controller
{
    /**
     * Get all payment gateways
     */
    public function index()
    {
        $gateways = PaymentGateway::ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $gateways,
        ]);
    }

    /**
     * Get single payment gateway
     */
    public function show(PaymentGateway $paymentGateway)
    {
        return response()->json([
            'success' => true,
            'data' => $paymentGateway,
        ]);
    }

    /**
     * Create new payment gateway
     */
    public function store(Request $request)
    {
        $merchant = Merchant::current();
        $merchantId = $merchant?->id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($merchantId) {
                    $exists = PaymentGateway::where('type', $value)
                        ->when($merchantId, function ($query) use ($merchantId) {
                            $query->where('merchant_id', $merchantId);
                        })
                        ->exists();
                    if ($exists) {
                        $fail('این نوع درگاه پرداخت قبلاً استفاده شده است.');
                    }
                },
            ],
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'config' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $validated['merchant_id'] = $merchantId;
        $gateway = PaymentGateway::create($validated);

        return response()->json([
            'success' => true,
            'data' => $gateway,
            'message' => 'درگاه پرداخت با موفقیت ایجاد شد',
        ], 201);
    }

    /**
     * Update payment gateway
     */
    public function update(Request $request, PaymentGateway $paymentGateway)
    {
        $merchant = Merchant::current();
        $merchantId = $merchant?->id;

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($merchantId, $paymentGateway) {
                    $exists = PaymentGateway::where('type', $value)
                        ->where('id', '!=', $paymentGateway->id)
                        ->when($merchantId, function ($query) use ($merchantId) {
                            $query->where('merchant_id', $merchantId);
                        })
                        ->exists();
                    if ($exists) {
                        $fail('این نوع درگاه پرداخت قبلاً استفاده شده است.');
                    }
                },
            ],
            'display_name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'config' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $paymentGateway->update($validated);

        return response()->json([
            'success' => true,
            'data' => $paymentGateway->fresh(),
            'message' => 'درگاه پرداخت با موفقیت به‌روزرسانی شد',
        ]);
    }

    /**
     * Delete payment gateway
     */
    public function destroy(PaymentGateway $paymentGateway)
    {
        // Check if gateway has transactions
        if ($paymentGateway->transactions()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'این درگاه دارای تراکنش است و قابل حذف نیست',
            ], 400);
        }

        $paymentGateway->delete();

        return response()->json([
            'success' => true,
            'message' => 'درگاه پرداخت با موفقیت حذف شد',
        ]);
    }

    /**
     * Toggle gateway active status
     */
    public function toggle(PaymentGateway $paymentGateway)
    {
        $paymentGateway->toggle();

        return response()->json([
            'success' => true,
            'data' => $paymentGateway->fresh(),
            'message' => $paymentGateway->is_active ? 'درگاه پرداخت فعال شد' : 'درگاه پرداخت غیرفعال شد',
        ]);
    }

    /**
     * Update gateway config
     */
    public function updateConfig(Request $request, PaymentGateway $paymentGateway)
    {
        $validated = $request->validate([
            'config' => 'required|array',
        ]);

        $paymentGateway->update([
            'config' => $validated['config'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $paymentGateway->fresh(),
            'message' => 'تنظیمات درگاه با موفقیت به‌روزرسانی شد',
        ]);
    }
}
