<?php

namespace App\Jobs;

use App\Models\ActivityLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class LogActivityJob implements ShouldQueue
{
    use Queueable;

    protected string $userId;

    protected string $action;

    protected array $data;

    /**
     * Create a new job instance.
     */
    public function __construct(string $userId, string $action, array $data = [])
    {
        $this->userId = $userId;
        $this->action = $action;
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        ActivityLog::create([
            'user_id' => $this->userId,
            'action' => $this->action,
            'data' => $this->data,
        ]);
    }
}
