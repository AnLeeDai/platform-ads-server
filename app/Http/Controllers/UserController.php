<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\UserGetRequest;

class UserController extends Controller
{
    public function index(UserGetRequest $request)
    {
        try {
            $per_page = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);

            $users = User::whereHas('role', function ($q) {
                $q->where('name', '!=', 'admin');
            })->simplePaginate($per_page, ['*'], 'page', $page);

            if ($users->isEmpty()) {
                return $this->errorResponse('No users found', 404);
            }

            return $this->successResponse($users, message: 'Users retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }
}
