<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Cache;

class ActivityLogService
{
    protected $cacheTtl = 1800; // 30 minutes

    public function getUserLogs(string $userId, int $perPage = 10, int $page = 1)
    {
        $cacheKey = "user_logs_{$userId}_page_{$page}_per_{$perPage}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($userId, $perPage, $page) {
            return ActivityLog::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->simplePaginate($perPage, ['*'], 'page', $page);
        });
    }

    public function logActivity(string $userId, string $action, array $data = []): void
    {
        // Use queue for logging to avoid blocking
        \App\Jobs\LogActivityJob::dispatch($userId, $action, $data);
    }
}