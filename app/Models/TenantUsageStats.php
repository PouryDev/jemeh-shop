<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantUsageStats extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'product_count',
        'storage_used_bytes',
    ];

    protected $casts = [
        'product_count' => 'integer',
        'storage_used_bytes' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function getStorageUsedInGB(): float
    {
        return round($this->storage_used_bytes / (1024 * 1024 * 1024), 2);
    }

    public function getStorageUsedInMB(): float
    {
        return round($this->storage_used_bytes / (1024 * 1024), 2);
    }
}

