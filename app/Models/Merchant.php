<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Merchant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'domain',
        'subdomain',
        'theme_id',
        'plan_id',
        'subscription_status',
        'telegram_chat_id',
        'settings',
        'is_active',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the current merchant instance from the application container.
     */
    public static function current(): ?self
    {
        if (!app()->bound('merchant')) {
            return null;
        }
        
        return app('merchant');
    }

    /**
     * Get the user that owns this merchant.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan for this merchant.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Get the theme for this merchant.
     */
    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    /**
     * Get the subscription for this merchant.
     */
    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class);
    }

    /**
     * Get the merchant users for this merchant.
     */
    public function merchantUsers(): HasMany
    {
        return $this->hasMany(MerchantUser::class);
    }

    /**
     * Get the users that belong to this merchant through merchant_users.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'merchant_users')
            ->withPivot('role', 'is_admin')
            ->withTimestamps();
    }

    /**
     * Get the admin users for this merchant.
     * Includes both users with is_admin=true in merchant_users and super admins (users.is_admin=true).
     */
    public function admins(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'merchant_users')
            ->wherePivot('is_admin', true)
            ->withTimestamps();
    }

    /**
     * Get the products for this merchant.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the orders for this merchant.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the delivery methods for this merchant.
     */
    public function deliveryMethods(): HasMany
    {
        return $this->hasMany(DeliveryMethod::class);
    }

    /**
     * Get the hero slides for this merchant.
     */
    public function heroSlides(): HasMany
    {
        return $this->hasMany(HeroSlide::class);
    }
}
