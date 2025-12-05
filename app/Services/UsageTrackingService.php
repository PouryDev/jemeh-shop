<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantUsageStats;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class UsageTrackingService
{
    /**
     * Update product count for a tenant
     */
    public function updateProductCount(Tenant $tenant): void
    {
        $count = Product::where('tenant_id', $tenant->id)->count();
        
        TenantUsageStats::updateOrCreate(
            ['tenant_id' => $tenant->id],
            ['product_count' => $count]
        );
    }

    /**
     * Add storage usage
     */
    public function addStorageUsage(Tenant $tenant, int $bytes): void
    {
        $stats = $tenant->getUsageStats();
        
        $stats->increment('storage_used_bytes', $bytes);
    }

    /**
     * Remove storage usage
     */
    public function removeStorageUsage(Tenant $tenant, int $bytes): void
    {
        $stats = $tenant->getUsageStats();
        
        $newStorage = max(0, $stats->storage_used_bytes - $bytes);
        $stats->update(['storage_used_bytes' => $newStorage]);
    }

    /**
     * Get usage stats for a tenant
     */
    public function getUsageStats(Tenant $tenant): TenantUsageStats
    {
        return $tenant->getUsageStats();
    }

    /**
     * Recalculate all usage stats for a tenant
     */
    public function recalculateUsageStats(Tenant $tenant): void
    {
        // Recalculate product count
        $this->updateProductCount($tenant);

        // Recalculate storage usage
        $this->recalculateStorageUsage($tenant);
    }

    /**
     * Recalculate storage usage by scanning actual files
     */
    public function recalculateStorageUsage(Tenant $tenant): void
    {
        $totalBytes = 0;

        // Get all product images for this tenant
        $productImages = \App\Models\ProductImage::where('tenant_id', $tenant->id)->get();
        
        foreach ($productImages as $image) {
            if (str_starts_with($image->path, 'http')) {
                // External URL, skip
                continue;
            }

            $filePath = storage_path('app/public/' . $image->path);
            if (file_exists($filePath)) {
                $totalBytes += filesize($filePath);
            }
        }

        // Update stats
        TenantUsageStats::updateOrCreate(
            ['tenant_id' => $tenant->id],
            ['storage_used_bytes' => $totalBytes]
        );
    }

    /**
     * Initialize usage stats for a tenant if not exists
     */
    public function initializeUsageStats(Tenant $tenant): void
    {
        $stats = TenantUsageStats::firstOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'product_count' => 0,
                'storage_used_bytes' => 0,
            ]
        );

        // Recalculate if stats are empty
        if ($stats->product_count === 0 && $stats->storage_used_bytes === 0) {
            $this->recalculateUsageStats($tenant);
        }
    }
}

