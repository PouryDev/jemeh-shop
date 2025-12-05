<?php

namespace App\Services;

use App\Models\Tenant;

class PlanService
{
    /**
     * Get plan limits configuration
     */
    private function getPlanLimitsConfig(): array
    {
        return [
            'starter' => [
                'max_products' => 50,
                'max_storage_bytes' => 1073741824, // 1 GB
                'features' => [
                    'unlimited_products' => false,
                    'unlimited_storage' => false,
                    'advanced_reports' => false,
                    'custom_themes' => false,
                    'payment_gateways' => false,
                    'discount_codes' => false,
                ],
            ],
            'pro' => [
                'max_products' => null, // unlimited
                'max_storage_bytes' => 10737418240, // 10 GB
                'features' => [
                    'unlimited_products' => true,
                    'unlimited_storage' => false,
                    'advanced_reports' => true,
                    'custom_themes' => true,
                    'payment_gateways' => true,
                    'discount_codes' => true,
                ],
            ],
            'enterprise' => [
                'max_products' => null, // unlimited
                'max_storage_bytes' => null, // unlimited
                'features' => [
                    'unlimited_products' => true,
                    'unlimited_storage' => true,
                    'advanced_reports' => true,
                    'custom_themes' => true,
                    'payment_gateways' => true,
                    'discount_codes' => true,
                    'api_access' => true,
                    'custom_integrations' => true,
                    'multi_store' => true,
                ],
            ],
        ];
    }

    /**
     * Get limits for a specific plan type
     */
    public function getPlanLimits(string $planType): array
    {
        $config = $this->getPlanLimitsConfig();
        return $config[$planType] ?? $config['starter'];
    }

    /**
     * Check if a limit is exceeded
     */
    public function checkLimit(Tenant $tenant, string $limitType, int $currentValue): bool
    {
        $planType = $tenant->getCurrentPlan();
        $limits = $this->getPlanLimits($planType);

        $limitKey = 'max_' . $limitType;
        $maxLimit = $limits[$limitKey] ?? null;

        // null means unlimited
        if ($maxLimit === null) {
            return true; // allowed
        }

        return $currentValue < $maxLimit;
    }

    /**
     * Check if tenant can create a new product
     */
    public function canCreateProduct(Tenant $tenant): array
    {
        $planType = $tenant->getCurrentPlan();
        $limits = $this->getPlanLimits($planType);
        $usageStats = $tenant->getUsageStats();

        $maxProducts = $limits['max_products'];

        // Enterprise and Pro (unlimited) can always create products
        if ($maxProducts === null) {
            return [
                'allowed' => true,
                'message' => null,
            ];
        }

        // Check if limit is reached
        if ($usageStats->product_count >= $maxProducts) {
            return [
                'allowed' => false,
                'message' => "شما به حداکثر تعداد محصولات ({$maxProducts}) رسیده‌اید. لطفاً پلن خود را ارتقا دهید.",
                'current' => $usageStats->product_count,
                'limit' => $maxProducts,
            ];
        }

        return [
            'allowed' => true,
            'message' => null,
            'current' => $usageStats->product_count,
            'limit' => $maxProducts,
        ];
    }

    /**
     * Check if tenant can upload a file with given size
     */
    public function canUploadFile(Tenant $tenant, int $fileSizeBytes): array
    {
        $planType = $tenant->getCurrentPlan();
        $limits = $this->getPlanLimits($planType);
        $usageStats = $tenant->getUsageStats();

        $maxStorage = $limits['max_storage_bytes'];

        // Enterprise (unlimited) can always upload
        if ($maxStorage === null) {
            return [
                'allowed' => true,
                'message' => null,
            ];
        }

        $newTotalStorage = $usageStats->storage_used_bytes + $fileSizeBytes;

        // Check if adding this file would exceed limit
        if ($newTotalStorage > $maxStorage) {
            $availableBytes = $maxStorage - $usageStats->storage_used_bytes;
            $availableMB = round($availableBytes / (1024 * 1024), 2);
            $maxStorageGB = round($maxStorage / (1024 * 1024 * 1024), 2);

            return [
                'allowed' => false,
                'message' => "فضای ذخیره‌سازی شما کافی نیست. فضای باقیمانده: {$availableMB} مگابایت از {$maxStorageGB} گیگابایت",
                'current_bytes' => $usageStats->storage_used_bytes,
                'limit_bytes' => $maxStorage,
                'available_bytes' => $availableBytes,
            ];
        }

        return [
            'allowed' => true,
            'message' => null,
            'current_bytes' => $usageStats->storage_used_bytes,
            'limit_bytes' => $maxStorage,
        ];
    }

    /**
     * Check if tenant has access to a specific feature
     */
    public function hasFeature(Tenant $tenant, string $feature): bool
    {
        $planType = $tenant->getCurrentPlan();
        $limits = $this->getPlanLimits($planType);

        return $limits['features'][$feature] ?? false;
    }

    /**
     * Get usage summary for a tenant
     */
    public function getUsageSummary(Tenant $tenant): array
    {
        $planType = $tenant->getCurrentPlan();
        $limits = $this->getPlanLimits($planType);
        $usageStats = $tenant->getUsageStats();

        return [
            'plan_type' => $planType,
            'products' => [
                'current' => $usageStats->product_count,
                'limit' => $limits['max_products'],
                'percentage' => $limits['max_products'] ? round(($usageStats->product_count / $limits['max_products']) * 100, 2) : 0,
            ],
            'storage' => [
                'current_bytes' => $usageStats->storage_used_bytes,
                'limit_bytes' => $limits['max_storage_bytes'],
                'current_gb' => $usageStats->getStorageUsedInGB(),
                'limit_gb' => $limits['max_storage_bytes'] ? round($limits['max_storage_bytes'] / (1024 * 1024 * 1024), 2) : null,
                'percentage' => $limits['max_storage_bytes'] ? round(($usageStats->storage_used_bytes / $limits['max_storage_bytes']) * 100, 2) : 0,
            ],
            'features' => $limits['features'],
        ];
    }
}

