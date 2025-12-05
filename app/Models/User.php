<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'email',
        'instagram_id',
        'phone',
        'password',
        'is_admin',
        'is_super_admin',
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
            'is_super_admin' => 'boolean',
        ];
    }

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin ?? false;
    }

    public function isTenantAdmin(?Tenant $tenant = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($tenant) {
            return $this->tenants()
                ->where('tenants.id', $tenant->id)
                ->wherePivot('role', 'admin')
                ->exists();
        }

        if (tenancy()->initialized) {
            return $this->isTenantAdmin(tenancy()->tenant);
        }

        return false;
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

}
