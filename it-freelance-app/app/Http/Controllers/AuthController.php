<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string',
            'user_type' => 'required|in:buyer,seller,administrator', // Enforcing valid roles
            'github_link' => 'nullable|url',
            'phone' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'user_type' => $validated['user_type'],
            'github_link' => $validated['github_link'] ?? null,
            'phone' => $validated['phone'] ?? null,
        ]);

        $message = $this->getRoleSpecificMessage($user->user_type, 'registered');

        return response()->json([
            'message' => $message,
            'id' => $user->id,
            'role' => $user->user_type,
        ], 201);
    }

    /**
     * Log in an existing user.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
            return response()->json(['error' => 'Invalid login credentials! ⚠️'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        $message = $this->getRoleSpecificMessage($user->user_type, 'logged in');

        return response()->json([
            'message' => $message,
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->user_type,
            'token' => $token,
        ]);
    }

    /**
     * Log out the user.
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();

        $message = $this->getRoleSpecificMessage($user->user_type, 'logged out');

        return response()->json(['message' => $message]);
    }

    /**
     * Get role-specific messages.
     */
    private function getRoleSpecificMessage(string $role, string $action): string
    {
        $roleMessages = [
            'buyer' => [
                'registered' => 'Welcome, valued buyer! Your account has been successfully created. 🎉',
                'logged in' => 'Hello, buyer! You are now logged in. 🛒',
                'logged out' => 'Goodbye, buyer! See you again soon! 👋',
            ],
            'seller' => [
                'registered' => 'Welcome, seller! Start offering your gigs today. 🎨',
                'logged in' => 'Hello, seller! You are now logged in to manage your gigs. 💼',
                'logged out' => 'Goodbye, seller! Come back to grow your business. 👋',
            ],
            'administrator' => [
                'registered' => 'Welcome, administrator! You now have access to manage the platform. 🛠️',
                'logged in' => 'Hello, administrator! Ready to oversee the platform? 🔧',
                'logged out' => 'Goodbye, administrator! Take care. 👋',
            ],
        ];

        return $roleMessages[$role][$action] ?? 'Action completed successfully.';
    }
}
