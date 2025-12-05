<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Facades\Tenancy;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (Tenancy::initialized()) {
                $tenant = Tenancy::tenant();
                if ($tenant) {
                    $builder->where('tenant_id', $tenant->id);
                }
            }
        });

        static::creating(function ($model) {
            if (Tenancy::initialized() && !$model->tenant_id) {
                $tenant = Tenancy::tenant();
                if ($tenant) {
                    $model->tenant_id = $tenant->id;
                }
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Tenant::class);
    }
}

