<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Tenant;
use App\Models\Domain;
use App\Models\TemplateSettings;
use App\Services\SubscriptionService;
use App\Services\UsageTrackingService;
use Illuminate\Support\Facades\DB;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $tenants = $user->tenants()->with('primaryDomain', 'templateSettings')->get();
        
        return response()->json([
            'success' => true,
            'data' => $tenants,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => [
                'required',
                'string',
                'max:255',
                'unique:domains,domain',
                'regex:/^([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i',
            ],
            'description' => 'nullable|string',
            'plan_type' => 'required|in:starter,pro,enterprise',
        ]);

        DB::beginTransaction();
        try {
            // Create tenant
            $tenant = Tenant::create([
                'id' => (string) Str::uuid(),
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'description' => $request->description,
                'is_active' => true,
            ]);

            // Create primary domain
            $domain = Domain::create([
                'domain' => $request->domain,
                'tenant_id' => $tenant->id,
                'is_primary' => true,
                'is_active' => true,
            ]);

            // Create default template settings
            TemplateSettings::create([
                'tenant_id' => $tenant->id,
                'primary_color' => '#000000',
                'secondary_color' => '#ffffff',
                'site_title' => $request->name,
            ]);

            // Create subscription
            $subscriptionService = new SubscriptionService();
            $subscriptionService->createSubscription($tenant, $request->plan_type);

            // Initialize usage stats
            $usageTrackingService = new UsageTrackingService();
            $usageTrackingService->initializeUsageStats($tenant);

            // Attach user as admin
            $user = Auth::user();
            $tenant->users()->attach($user->id, ['role' => 'admin']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $tenant->load('primaryDomain', 'templateSettings', 'subscription'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'خطا در ایجاد tenant: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, Tenant $tenant)
    {
        $user = Auth::user();
        
        // Check if user has access to this tenant
        if (!$user->isSuperAdmin() && !$user->tenants()->where('tenants.id', $tenant->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'دسترسی غیرمجاز',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $tenant->load('domains', 'templateSettings', 'users'),
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $user = Auth::user();
        
        // Check if user has access to this tenant
        if (!$user->isSuperAdmin() && !$user->tenants()->where('tenants.id', $tenant->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'دسترسی غیرمجاز',
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $tenant->update($request->only(['name', 'description', 'is_active']));

        return response()->json([
            'success' => true,
            'data' => $tenant->fresh()->load('domains', 'templateSettings'),
        ]);
    }

    public function destroy(Request $request, Tenant $tenant)
    {
        $user = Auth::user();
        
        // Check if user has access to this tenant
        if (!$user->isSuperAdmin() && !$user->tenants()->where('tenants.id', $tenant->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'دسترسی غیرمجاز',
            ], 403);
        }

        $tenant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tenant با موفقیت حذف شد',
        ]);
    }
}

