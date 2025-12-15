<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\MerchantUser;
use App\Models\Merchant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'login_field' => 'required|string', // Can be instagram_id or phone
            'password' => 'required',
        ]);

        // Try to find user by instagram_id or phone
        $user = User::where('instagram_id', $request->login_field)
                   ->orWhere('phone', $request->login_field)
                   ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login_field' => ['اطلاعات وارد شده صحیح نیست.'],
            ]);
        }

        // Create Sanctum token
        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'instagram_id' => 'nullable|string|max:255|unique:users,instagram_id',
            'phone' => 'required|string|max:255|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'instagram_id' => filled($validated['instagram_id'] ?? null) ? $validated['instagram_id'] : null,
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
        ]);

        // Create Sanctum token for new user
        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function logout(Request $request)
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'با موفقیت خارج شدید'
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'کاربر احراز هویت نشده است'
            ], 401);
        }

        $data = $user->toArray();
        $merchantID = $request->header('X-Merchant-Id');

        if ($data['is_admin'] || is_null($merchantID)) {
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        }

        $merchant = Merchant::current();
        if ($merchant) {
            $user = MerchantUser::query()->where('user_id', $data['id'])
                ->where('merchant_id', $merchant->id)
                ->first();

            $data['is_admin'] = $user->is_admin == 1;
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
