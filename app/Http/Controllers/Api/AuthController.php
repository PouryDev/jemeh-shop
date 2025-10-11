<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string', // instagram_id or phone
            'password' => 'required',
        ]);

        // Try to find user by instagram_id or phone
        $user = User::where('instagram_id', $request->username)
            ->orWhere('phone', $request->username)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['اطلاعات وارد شده صحیح نیست.'],
            ]);
        }

        // Login user using web session
        Auth::login($user);
        $request->session()->regenerate();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'instagram_id' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:20|unique:users',
        ]);

        $user = User::create([
            'name' => $request->name,
            'instagram_id' => $request->instagram_id,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
        ]);

        // Login user using web session
        Auth::login($user);
        $request->session()->regenerate();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'با موفقیت خارج شدید'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    }
}
