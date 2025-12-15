<?php

namespace App\Models;

use App\Models\Scopes\MerchantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class DiscountCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'merchant_id',
        'code',
        'type',
        'value',
        'usage_limit',
        'used_count',
        'max_discount_amount',
        'min_order_amount',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new MerchantScope);
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(DiscountCodeUsage::class);
    }

    public function isExpired(): bool
    {
        if (!$this->is_active) {
            return true;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return true;
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return true;
        }

        return false;
    }

    public function isUsageLimitReached(): bool
    {
        if (!$this->usage_limit) {
            return false;
        }

        return $this->used_count >= $this->usage_limit;
    }

    public function canBeUsed(): bool
    {
        return !$this->isExpired() && !$this->isUsageLimitReached();
    }

    public function calculateDiscount(int $orderAmount): int
    {
        if ($this->type === 'percentage') {
            $discount = ($orderAmount * $this->value) / 100;
        } else {
            $discount = $this->value;
        }

        // Apply maximum discount limit if set
        if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
            $discount = $this->max_discount_amount;
        }

        // Don't discount more than the order amount
        return min($discount, $orderAmount);
    }

    public static function generateCode(int $length = 8): string
    {
        do {
            $code = strtoupper(Str::random($length));
        } while (static::where('code', $code)->exists());

        return $code;
    }

    public function incrementUsage(): void
    {
        $this->increment('used_count');
    }
}