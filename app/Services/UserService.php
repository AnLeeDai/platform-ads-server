<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class UserService
{
    protected $cacheTtl = 3600; // 1 hour

    public function getUsers(int $perPage = 10, int $page = 1)
    {
        $cacheKey = "users_page_{$page}_per_{$perPage}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($perPage, $page) {
            return User::with('role')->simplePaginate($perPage, ['*'], 'page', $page);
        });
    }

    public function getUserById(string $id): ?User
    {
        return Cache::remember("user_{$id}", $this->cacheTtl, function () use ($id) {
            return User::with('role')->find($id);
        });
    }
}
