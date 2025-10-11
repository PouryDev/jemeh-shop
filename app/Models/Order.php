<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_address',
        'total_amount',
        'discount_code',
        'discount_amount',
        'final_amount',
        'status',
        'receipt_path',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function discountCodeUsage(): HasOne
    {
        return $this->hasOne(DiscountCodeUsage::class);
    }

    public function getDiscountCode(): ?DiscountCode
    {
        if (!$this->discount_code) {
            return null;
        }

        return DiscountCode::where('code', $this->discount_code)->first();
    }
}


