<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MerchantController extends Controller
{
    /**
     * Get current merchant theme
     */
    public function getTheme()
    {
        $merchant = Merchant::current();

        if (!$merchant) {
            // Return default theme for landing page
            $defaultTheme = Theme::where('slug', 'default')->first();
            return response()->json([
                'success' => true,
                'data' => [
                    'merchant' => null,
                    'theme' => $defaultTheme,
                ]
            ]);
        }

        $merchant->load('theme', 'plan');

        return response()->json([
            'success' => true,
            'data' => [
                'merchant' => $merchant,
                'theme' => $merchant->theme,
            ]
        ]);
    }

    /**
     * Get merchant info
     */
    public function info()
    {
        $merchant = Merchant::current();

        if (!$merchant) {
            // Return success response with null data for landing page
            return response()->json([
                'success' => true,
                'data' => null,
                'merchant_id' => null
            ]);
        }

        $merchant->load('plan', 'theme', 'subscription');

        // Add counts for dashboard
        $merchant->products_count = $merchant->products()->count();
        $merchant->orders_count = $merchant->orders()->count();
        $merchant->total_revenue = $merchant->orders()->where('status', 'completed')->sum('final_amount');

        return response()->json([
            'success' => true,
            'data' => $merchant,
            'merchant_id' => $merchant->id
        ])->header('X-Merchant-Id', $merchant->id);
    }

    /**
     * Get available themes for merchant
     */
    public function getAvailableThemes()
    {
        $merchant = Merchant::current();

        // Get themes based on plan
        // Basic plan: only default theme
        // Professional+: all themes
        // Landing page: show all themes for preview
        $query = Theme::where('is_active', true);

        if ($merchant && $merchant->plan && !$merchant->plan->hasFeature('custom_templates')) {
            $query->where('slug', 'default');
        }

        $themes = $query->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $themes
        ]);
    }

    /**
     * Update merchant theme (requires authentication)
     */
    public function updateTheme(Request $request)
    {
        $merchant = Merchant::current();

        if (!$merchant) {
            return response()->json([
                'success' => false,
                'message' => 'Merchant not found'
            ], 404);
        }

        // Check if user owns this merchant
        if ($merchant->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if plan allows custom templates
        if ($merchant->plan && !$merchant->plan->hasFeature('custom_templates')) {
            return response()->json([
                'success' => false,
                'message' => 'تغییر قالب در پلن شما موجود نیست. لطفاً پلن خود را ارتقا دهید.'
            ], 403);
        }

        $validated = $request->validate([
            'theme_id' => 'required|exists:themes,id',
        ]);

        $theme = Theme::findOrFail($validated['theme_id']);

        $merchant->update([
            'theme_id' => $theme->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'قالب با موفقیت تغییر کرد',
            'data' => [
                'merchant' => $merchant->fresh()->load('theme'),
                'theme' => $theme,
            ]
        ]);
    }

    /**
     * Update merchant settings (website title and logo)
     */
    public function updateSettings(Request $request)
    {
        $merchant = Merchant::current();

        if (!$merchant) {
            return response()->json([
                'success' => false,
                'message' => 'Merchant not found'
            ], 404);
        }

        // Check if user owns this merchant
        if ($merchant->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $validated = $request->validate([
                'website_title' => 'nullable|string|max:255',
                'logo' => 'nullable|image|max:2048', // 2MB max
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطا در اعتبارسنجی داده‌ها',
                'errors' => $e->errors()
            ], 422);
        }

        $settings = $merchant->settings ?? [];

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if (!empty($settings['logo_path'])) {
                Storage::disk('public')->delete($settings['logo_path']);
            }

            // Store new logo
            $logoPath = $request->file('logo')->store('merchants/logo', 'public');
            $settings['logo_path'] = $logoPath;
        }

        $settings['website_title'] = $request->website_title;

        // Update merchant settings
        $merchant->update([
            'settings' => $settings
        ]);

        \Log::info('Merchant settings updated', [
            'merchant_id' => $merchant->id,
            'settings' => $settings,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تنظیمات با موفقیت به‌روزرسانی شد',
            'data' => [
                'merchant' => $merchant->fresh(),
                'settings' => $settings,
            ]
        ]);
    }
}
