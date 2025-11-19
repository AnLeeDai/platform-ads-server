<?php

namespace App\Http\Controllers;

use App\Http\Requests\RolePostRequest;
use Illuminate\Http\Request;
use App\Models\Role;

class RoleController extends Controller
{

    private Role $roleModel;

    public function __construct()
    {
        $this->roleModel = new Role();
    }


    public function index(Request $request)
    {
        try {
            $per_page = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);
            $roles = $this->roleModel->index($per_page, $page);

            if (!$roles) {
                return $this->errorResponse();
            }

            return $this->successResponse(data: $roles);
        } catch (\Exception $e) {
            return $this->errorResponse(status: 500, data: $e->getMessage());
        }
    }

    public function store(RolePostRequest $request)
    {
        try {
            $validated = $request->validated();

            $role = $this->roleModel->create($validated);

            if (!$role) {
                return $this->errorResponse(message: 'Failed to create role', status: 500);
            }

            return $this->successResponse(data: $role);
        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Server Error', status: 500, data: $e->getMessage());
        }
    }
}
