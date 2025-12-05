<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\Domain;

class TenantManagementController extends Controller
{
    public function dashboard(Request $request)
    {
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('is_active', true)->count();
        $inactiveTenants = Tenant::where('is_active', false)->count();
        
        $recentTenants = Tenant::with('primaryDomain')
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_tenants' => $totalTenants,
                'active_tenants' => $activeTenants,
                'inactive_tenants' => $inactiveTenants,
                'recent_tenants' => $recentTenants,
            ],
        ]);
    }

    public function index(Request $request)
    {
        $tenants = Tenant::with('primaryDomain', 'templateSettings')
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $tenants,
        ]);
    }

    public function show(Request $request, Tenant $tenant)
    {
        return response()->json([
            'success' => true,
            'data' => $tenant->load('domains', 'templateSettings', 'users'),
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
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
        $tenant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tenant با موفقیت حذف شد',
        ]);
    }

    public function activate(Request $request, Tenant $tenant)
    {
        $tenant->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Tenant فعال شد',
            'data' => $tenant->fresh(),
        ]);
    }

    public function deactivate(Request $request, Tenant $tenant)
    {
        $tenant->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Tenant غیرفعال شد',
            'data' => $tenant->fresh(),
        ]);
    }
}

