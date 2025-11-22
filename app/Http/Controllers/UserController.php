<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserGetRequest;
use App\Models\User;
use App\Services\UserService;

class UserController extends Controller
{
    private User $userModel;

    private UserService $userService;

    public function __construct(
        User $userModel,
        UserService $userService
    ) {
        $this->userModel = $userModel;
        $this->userService = $userService;
    }

    public function index(UserGetRequest $request)
    {
        try {
            $per_page = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);

            $users = $this->userService->getUsers($per_page, $page);

            if ($users->isEmpty()) {
                return $this->errorResponse('No users found', 404);
            }

            return $this->successResponse($users, message: 'Users retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }
}
