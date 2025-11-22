<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleGetRequest;
use App\Models\Role;
// use App\Http\Requests\RolePostRequest;
use App\Services\RoleService;

class RoleController extends Controller
{
    private Role $roleModel;

    private RoleService $roleService;

    public function __construct(
        Role $roleModel,
        RoleService $roleService
    ) {
        $this->roleModel = $roleModel;
        $this->roleService = $roleService;
    }

    public function index(RoleGetRequest $request)
    {
        try {
            $validated = $request->validated();

            $per_page = $validated['per_page'];
            $page = $validated['page'];

            $roles = $this->roleService->getRoles($per_page, $page);

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
