<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\CommissionService;

class OrderObserver
{
    protected CommissionService $commissionService;

    public function __construct(CommissionService $commissionService)
    {
        $this->commissionService = $commissionService;
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Check if status changed to 'completed'
        if ($order->wasChanged('status') && $order->status === 'completed') {
            // Only calculate commission if it hasn't been calculated yet
            if (!$order->commission_amount && !$order->commissions()->exists()) {
                $this->commissionService->calculateAndRecordCommission($order);
            }
        }

        // If order is cancelled and commission exists, cancel the commission
        if ($order->wasChanged('status') && $order->status === 'cancelled') {
            $commissions = $order->commissions()->where('status', 'pending')->get();
            foreach ($commissions as $commission) {
                $this->commissionService->markCommissionAsCanceled($commission);
            }
        }
    }
}
