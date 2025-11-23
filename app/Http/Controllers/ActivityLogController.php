<?php

namespace App\Http\Controllers;

use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    protected ActivityLogService $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            $per_page = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);

            $logs = $this->activityLogService->getUserLogs($user->id, $per_page, $page);

            return $this->successResponse($logs, 'Activity logs retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Server Error', 500, $e->getMessage());
        }
    }
}
