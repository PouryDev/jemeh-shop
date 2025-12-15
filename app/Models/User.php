<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'instagram_id',
        'phone',
        'password',
        'is_admin',
        'address',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    public function discountCodeUsages(): HasMany
    {
        return $this->hasMany(DiscountCodeUsage::class);
    }

    public function hasUsedDiscountCode(string $code): bool
    {
        return $this->discountCodeUsages()
            ->whereHas('discountCode', function ($query) use ($code) {
                $query->where('code', $code);
            })
            ->exists();
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function defaultAddress()
    {
        return $this->hasOne(Address::class)->where('is_default', true);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the merchants that this user belongs to through merchant_users.
     */
    public function merchants(): BelongsToMany
    {
        return $this->belongsToMany(Merchant::class, 'merchant_users')
            ->withPivot('role', 'is_admin')
            ->withTimestamps();
    }

    /**
     * Get the merchant users for this user.
     */
    public function merchantUsers(): HasMany
    {
        return $this->hasMany(MerchantUser::class);
    }

    /**
     * Check if user is admin of a specific merchant.
     * 
     * If user.is_admin is true, they are admin in all merchants (super admin).
     * Otherwise, check if merchant_users.is_admin is true for this specific merchant.
     */
    public function isAdminOf(Merchant $merchant): bool
    {
        // Super admin: if user is admin in users table, they are admin in all merchants
        if ($this->is_admin) {
            return true;
        }

        // Check if user is admin in this specific merchant
        return $this->merchantUsers()
            ->where('merchant_id', $merchant->id)
            ->where('is_admin', true)
            ->exists();
    }

}
