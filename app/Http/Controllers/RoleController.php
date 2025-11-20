<?php

namespace App\Http\Controllers;

use App\Models\Role;
// use App\Http\Requests\RolePostRequest;
use App\Http\Requests\RoleGetRequest;

class RoleController extends Controller
{

    private Role $roleModel;

    public function __construct()
    {
        $this->roleModel = new Role();
    }


    public function index(RoleGetRequest $request)
    {
        try {
            $validated = $request->validated();

            $per_page = $validated['per_page'];
            $page = $validated['page'];

            $roles = $this->roleModel->simplePaginate($per_page, ['*'], 'page', $page);

            if ($roles->isEmpty()) {
                return $this->errorResponse('No roles found', 404);
            }

            return $this->successResponse(data: $roles);
        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }

    // public function store(RolePostRequest $request)
    // {
    //     try {
    //         $validated = $request->validated();

    //         $role = $this->roleModel->create($validated);

    //         if (!$role) {
    //             return $this->errorResponse(message: 'Failed to create role', status: 500);
    //         }

    //         return $this->successResponse(data: $role);
    //     } catch (\Exception $e) {
    //         return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
    //     }
    // }
}
