<?php

namespace App\Http\Controllers\Concerns;

use App\Services\FeatureGateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

trait ChecksPlanLimits
{
    protected FeatureGateService $featureGate;

    public function __construct()
    {
        $this->featureGate = App::make(FeatureGateService::class);
    }

    /**
     * Check if merchant can create more products
     */
    protected function checkProductLimit(): void
    {
        if (!$this->featureGate->canCreateMoreProducts()) {
            $remaining = $this->featureGate->getRemainingProductSlots();
            abort(403, "شما به حداکثر تعداد محصولات مجاز رسیده‌اید. ({$remaining} محصول باقی مانده) لطفاً پلن خود را ارتقا دهید.");
        }
    }

    /**
     * Check if merchant can create more slides
     */
    protected function checkSlideLimit(): void
    {
        if (!$this->featureGate->canCreateMoreSlides()) {
            $remaining = $this->featureGate->getRemainingSlideSlots();
            abort(403, "شما به حداکثر تعداد اسلایدهای مجاز رسیده‌اید. ({$remaining} اسلاید باقی مانده) لطفاً پلن خود را ارتقا دهید.");
        }
    }

    /**
     * Check if merchant can create more delivery methods
     */
    protected function checkDeliveryMethodLimit(): void
    {
        if (!$this->featureGate->canCreateMoreDeliveryMethods()) {
            $remaining = $this->featureGate->getRemainingDeliveryMethodSlots();
            abort(403, "شما به حداکثر تعداد روش‌های ارسال مجاز رسیده‌اید. ({$remaining} روش باقی مانده) لطفاً پلن خود را ارتقا دهید.");
        }
    }

    /**
     * Check if merchant can use product variants
     */
    protected function checkProductVariantsFeature(): void
    {
        if (!$this->featureGate->canUseProductVariants()) {
            abort(403, 'استفاده از variant های محصول در پلن شما موجود نیست. لطفاً پلن خود را ارتقا دهید.');
        }
    }

    /**
     * Check if merchant can use campaigns
     */
    protected function checkCampaignsFeature(): void
    {
        if (!$this->featureGate->canUseCampaigns()) {
            abort(403, 'استفاده از کمپین‌های تخفیف در پلن شما موجود نیست. لطفاً پلن خود را ارتقا دهید.');
        }
    }
}


