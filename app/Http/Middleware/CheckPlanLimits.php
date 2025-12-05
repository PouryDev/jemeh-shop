<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Facades\Tenancy;
use App\Services\PlanService;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanLimits
{
    protected $planService;

    public function __construct(PlanService $planService)
    {
        $this->planService = $planService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $limitType  The type of limit to check (e.g., 'products', 'storage')
     */
    public function handle(Request $request, Closure $next, string $limitType = 'products'): Response
    {
        // Only check limits in tenant context
        if (!Tenancy::initialized()) {
            return $next($request);
        }

        $tenant = Tenancy::tenant();
        
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found'
            ], 404);
        }

        // Check product limit
        if ($limitType === 'products') {
            $check = $this->planService->canCreateProduct($tenant);
            
            if (!$check['allowed']) {
                return response()->json([
                    'success' => false,
                    'message' => $check['message'],
                    'limit_reached' => true,
                    'current' => $check['current'] ?? null,
                    'limit' => $check['limit'] ?? null,
                ], 403);
            }
        }

        // Check storage limit (for file uploads)
        if ($limitType === 'storage') {
            $fileSize = $request->file('file')?->getSize() ?? 
                       $request->file('image')?->getSize() ?? 
                       $request->input('file_size', 0);
            
            if ($fileSize > 0) {
                $check = $this->planService->canUploadFile($tenant, $fileSize);
                
                if (!$check['allowed']) {
                    return response()->json([
                        'success' => false,
                        'message' => $check['message'],
                        'limit_reached' => true,
                        'current_bytes' => $check['current_bytes'] ?? null,
                        'limit_bytes' => $check['limit_bytes'] ?? null,
                        'available_bytes' => $check['available_bytes'] ?? null,
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}

