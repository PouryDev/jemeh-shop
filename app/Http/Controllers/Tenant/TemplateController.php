<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stancl\Tenancy\Facades\Tenancy;
use App\Models\TemplateSettings;

class TemplateController extends Controller
{
    public function show(Request $request)
    {
        $tenant = Tenancy::tenant();
        
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $settings = $tenant->templateSettings;
        
        if (!$settings) {
            // Create default settings if they don't exist
            $settings = TemplateSettings::create([
                'tenant_id' => $tenant->id,
                'primary_color' => '#000000',
                'secondary_color' => '#ffffff',
                'site_title' => $tenant->name,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $tenant = Tenancy::tenant();
        
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $request->validate([
            'primary_color' => 'sometimes|string|max:7',
            'secondary_color' => 'sometimes|string|max:7',
            'font_family' => 'nullable|string|max:255',
            'logo_path' => 'nullable|string|max:255',
            'favicon_path' => 'nullable|string|max:255',
            'site_title' => 'nullable|string|max:255',
            'site_description' => 'nullable|string',
            'custom_css' => 'nullable|array',
            'custom_settings' => 'nullable|array',
        ]);

        $settings = $tenant->templateSettings;
        
        if (!$settings) {
            $settings = TemplateSettings::create([
                'tenant_id' => $tenant->id,
            ]);
        }

        $settings->update($request->only([
            'primary_color',
            'secondary_color',
            'font_family',
            'logo_path',
            'favicon_path',
            'site_title',
            'site_description',
            'custom_css',
            'custom_settings',
        ]));

        return response()->json([
            'success' => true,
            'data' => $settings->fresh(),
        ]);
    }
}

