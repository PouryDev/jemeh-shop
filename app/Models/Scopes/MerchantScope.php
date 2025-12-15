<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class MerchantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $merchant = \App\Models\Merchant::current();
        
        if ($merchant && $model->getTable() !== 'merchants') {
            $builder->where($model->getTable() . '.merchant_id', $merchant->id);
        }
    }

    /**
     * Extend the query builder with the needed functions.
     */
    public function extend(Builder $builder): void
    {
        $builder->macro('withoutMerchantScope', function (Builder $builder) {
            return $builder->withoutGlobalScope($this);
        });

        $builder->macro('withMerchantScope', function (Builder $builder, $merchantId) {
            return $builder->withoutGlobalScope($this)->where($builder->getModel()->getTable() . '.merchant_id', $merchantId);
        });
    }
}