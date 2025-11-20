<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Controller;
use Closure;
use Illuminate\Http\Request;

class RoleMiddleware extends Controller
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth()->user();

        if (!$user) {
            return $this->errorResponse(message: 'Please log in to access this resource.', status: 401);
        }

        $role = $user->role;

        $roleName = \is_string($role) ? $role : data_get($role, 'name');

        if (!\in_array($roleName, $roles, true)) {
            return $this->errorResponse(message: 'Forbidden: You do not have permission to access this resource.', status: 403);
        }

        return $next($request);
    }
}
