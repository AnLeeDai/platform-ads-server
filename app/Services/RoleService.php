<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Support\Facades\Cache;

class RoleService
{
    protected $cacheTtl = 3600; // 1 hour

    public function getRoles(int $perPage = 10, int $page = 1)
    {
        $cacheKey = "roles_page_{$page}_per_{$perPage}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($perPage, $page) {
            return Role::simplePaginate($perPage, ['*'], 'page', $page);
        });
    }
}