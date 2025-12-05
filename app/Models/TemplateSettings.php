<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateSettings extends Model
{
    protected $table = 'template_settings';

    protected $fillable = [
        'tenant_id',
        'primary_color',
        'secondary_color',
        'font_family',
        'logo_path',
        'favicon_path',
        'site_title',
        'site_description',
        'custom_css',
        'custom_settings',
    ];

    protected $casts = [
        'custom_css' => 'array',
        'custom_settings' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}

