<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Plan;
use Illuminate\Support\Facades\DB;

class CommissionService
{
    /**
     * Calculate and record commission for an order
     */
    public function calculateAndRecordCommission(Order $order): ?Commission
    {
        $merchant = $order->merchant;
        
        if (!$merchant || !$merchant->plan) {
            return null;
        }

        // Only calculate commission for Basic plan
        $commissionRate = $merchant->plan->getLimit('commission_rate');
        
        if (!$commissionRate || $commissionRate <= 0) {
            return null;
        }

        // Calculate commission amount
        $commissionAmount = (int) round(($order->final_amount * $commissionRate) / 100);

        if ($commissionAmount <= 0) {
            return null;
        }

        return DB::transaction(function () use ($order, $merchant, $commissionRate, $commissionAmount) {
            // Update order with commission info
            $order->update([
                'commission_rate' => $commissionRate,
                'commission_amount' => $commissionAmount,
            ]);

            // Create commission record
            $commission = Commission::create([
                'merchant_id' => $merchant->id,
                'order_id' => $order->id,
                'amount' => $commissionAmount,
                'percentage' => $commissionRate,
                'status' => 'pending',
            ]);

            return $commission;
        });
    }

    /**
     * Mark commission as paid
     */
    public function markCommissionAsPaid(Commission $commission): Commission
    {
        return $commission->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]) ? $commission->fresh() : $commission;
    }

    /**
     * Mark commission as canceled
     */
    public function markCommissionAsCanceled(Commission $commission): Commission
    {
        return $commission->update([
            'status' => 'canceled',
        ]) ? $commission->fresh() : $commission;
    }

    /**
     * Get total pending commissions for a merchant
     */
    public function getTotalPendingCommissions(Merchant $merchant): int
    {
        return $merchant->commissions()
            ->where('status', 'pending')
            ->sum('amount');
    }

    /**
     * Get total paid commissions for a merchant
     */
    public function getTotalPaidCommissions(Merchant $merchant): int
    {
        return $merchant->commissions()
            ->where('status', 'paid')
            ->sum('amount');
    }

    /**
     * Get commissions summary for a merchant
     */
    public function getCommissionsSummary(Merchant $merchant): array
    {
        return [
            'pending' => $this->getTotalPendingCommissions($merchant),
            'paid' => $this->getTotalPaidCommissions($merchant),
            'total' => $merchant->commissions()->sum('amount'),
            'count' => [
                'pending' => $merchant->commissions()->where('status', 'pending')->count(),
                'paid' => $merchant->commissions()->where('status', 'paid')->count(),
                'canceled' => $merchant->commissions()->where('status', 'canceled')->count(),
            ],
        ];
    }

    /**
     * Bulk mark commissions as paid
     */
    public function bulkMarkAsPaid(array $commissionIds): int
    {
        return Commission::whereIn('id', $commissionIds)
            ->where('status', 'pending')
            ->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
    }
}


