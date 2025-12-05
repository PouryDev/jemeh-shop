<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Tenant;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $tenants = $user->tenants()->with('primaryDomain')->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'tenants' => $tenants,
                'tenants_count' => $tenants->count(),
            ],
        ]);
    }
}

