<?php

namespace App\Services;

use App\Models\Merchant;
use App\Models\Plan;

class FeatureGateService
{
    protected ?Merchant $merchant;

    public function __construct(?Merchant $merchant = null)
    {
        $this->merchant = $merchant ?? Merchant::current();
    }

    /**
     * Check if merchant can use product variants
     */
    public function canUseProductVariants(): bool
    {
        if (!$this->merchant || !$this->merchant->plan) {
            return false;
        }

        return $this->merchant->plan->hasFeature('product_variants') ?? false;
    }

    /**
     * Check if merchant can use campaigns
     */
    public function canUseCampaigns(): bool
    {
        if (!$this->merchant || !$this->merchant->plan) {
            return false;
        }

        return $this->merchant->plan->hasFeature('campaigns') ?? false;
    }

    /**
     * Check analytics access level
     * Returns: 'none', 'basic', 'full'
     */
    public function hasAnalyticsAccess(): string
    {
        if (!$this->merchant || !$this->merchant->plan) {
            return 'none';
        }

        return $this->merchant->plan->hasFeature('analytics') ?? 'none';
    }

    /**
     * Check if merchant can use Telegram notifications
     */
    public function canUseTelegramNotifications(): bool
    {
        if (!$this->merchant || !$this->merchant->plan) {
            return false;
        }

        return $this->merchant->plan->hasFeature('telegram_notifications') ?? false;
    }

    /**
     * Check if merchant has custom domain
     */
    public function hasCustomDomain(): bool
    {
        if (!$this->merchant || !$this->merchant->plan) {
            return false;
        }

        return $this->merchant->plan->hasFeature('custom_domain') ?? false;
    }

    /**
     * Check if merchant can use custom templates
     */
    public function canUseCustomTemplates(): bool
    {
        if (!$this->merchant || !$this->merchant->plan) {
            return false;
        }

        return $this->merchant->plan->hasFeature('custom_templates') ?? false;
    }

    /**
     * Check if merchant can create more products
     */
    public function canCreateMoreProducts(): bool
    {
        if (!$this->merchant) {
            return false;
        }

        $maxProducts = $this->merchant->plan->getLimit('max_products');
        
        if ($maxProducts === null) {
            return true; // Unlimited
        }

        $currentCount = $this->merchant->products()->count();
        return $currentCount < $maxProducts;
    }

    /**
     * Check if merchant can create more slides
     */
    public function canCreateMoreSlides(): bool
    {
        if (!$this->merchant) {
            return false;
        }

        $maxSlides = $this->merchant->plan->getLimit('max_slides');
        
        if ($maxSlides === null) {
            return true; // Unlimited
        }

        $currentCount = $this->merchant->heroSlides()->count();
        return $currentCount < $maxSlides;
    }

    /**
     * Check if merchant can create more delivery methods
     */
    public function canCreateMoreDeliveryMethods(): bool
    {
        if (!$this->merchant) {
            return false;
        }

        $maxMethods = $this->merchant->plan->getLimit('max_delivery_methods');
        
        if ($maxMethods === null) {
            return true; // Unlimited
        }

        $currentCount = $this->merchant->deliveryMethods()->count();
        return $currentCount < $maxMethods;
    }

    /**
     * Get commission rate for merchant (only for Basic plan)
     */
    public function getCommissionRate(): ?float
    {
        if (!$this->merchant || !$this->merchant->plan) {
            return null;
        }

        return $this->merchant->plan->getLimit('commission_rate');
    }

    /**
     * Check if merchant has active subscription
     */
    public function hasActiveSubscription(): bool
    {
        if (!$this->merchant) {
            return false;
        }

        $subscription = $this->merchant->subscription;
        return $subscription && $subscription->isActive();
    }

    /**
     * Get remaining product slots
     */
    public function getRemainingProductSlots(): ?int
    {
        if (!$this->merchant) {
            return null;
        }

        $maxProducts = $this->merchant->plan->getLimit('max_products');
        
        if ($maxProducts === null) {
            return null; // Unlimited
        }

        $currentCount = $this->merchant->products()->count();
        return max(0, $maxProducts - $currentCount);
    }

    /**
     * Get remaining slide slots
     */
    public function getRemainingSlideSlots(): ?int
    {
        if (!$this->merchant) {
            return null;
        }

        $maxSlides = $this->merchant->plan->getLimit('max_slides');
        
        if ($maxSlides === null) {
            return null; // Unlimited
        }

        $currentCount = $this->merchant->heroSlides()->count();
        return max(0, $maxSlides - $currentCount);
    }

    /**
     * Get remaining delivery method slots
     */
    public function getRemainingDeliveryMethodSlots(): ?int
    {
        if (!$this->merchant) {
            return null;
        }

        $maxMethods = $this->merchant->plan->getLimit('max_delivery_methods');
        
        if ($maxMethods === null) {
            return null; // Unlimited
        }

        $currentCount = $this->merchant->deliveryMethods()->count();
        return max(0, $maxMethods - $currentCount);
    }
}


