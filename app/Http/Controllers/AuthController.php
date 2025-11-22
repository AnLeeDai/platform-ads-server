<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserLoginRequest;
use App\Models\User;
use App\Models\Role;
use App\Http\Requests\UserPostRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth; // Cần import Auth facade

class AuthController extends Controller
{

    private User $userModel;

    private Role $roleModel;

    public function __construct(
        User $userModel,
        Role $roleModel
    ) {
        $this->userModel = $userModel;
        $this->roleModel = $roleModel;
    }


    public function me()
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return $this->errorResponse(message: 'Unauthorized', status: 401);
            }

            return $this->successResponse(data: $user);
        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }

    public function index(UserLoginRequest $request)
    {
        try {
            $validated = $request->validated();

            $email = $validated['email'];
            $password = $validated['password'];

            $user = $this->userModel->where('email', $email)->first();

            if (!$user) {
                return $this->errorResponse(message: 'User not found', status: 404);
            }

            if (!Hash::check($password, $user->password_hash)) {
                return $this->errorResponse(message: 'Invalid password', status: 401);
            }

            Auth::login($user);


            return $this->successResponse(
                data: ['user' => $user],
                message: 'Login successful',
                status: 200
            );

        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }

    public function store(UserPostRequest $request)
    {
        try {
            $validated = $request->validated();


            $userRole = Role::where('name', 'user')->first();

            $avatar_url = 'https://placehold.co/400';

            $email = $validated['email'];
            $user_name = explode('@', $email)[0];

            $user = $this->userModel->create([
                'role_id' => $userRole?->id,
                'user_name' => $user_name,
                'email' => $validated['email'],
                'avatar_url' => $avatar_url,
                'phone_number' => $validated['phone_number'],
                'password_hash' => bcrypt($validated['password_hash']),
            ]);

            return $this->successResponse(data: $user, message: 'User created successfully', status: 201);
        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }

    public function logout()
    {
        try {
            Auth::guard('web')->logout();

            $user = auth()->user();
            if ($user) {
                $user->tokens()->delete();
            }

            return $this->successResponse(data: [], message: 'Logged out successfully');

        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }
}