<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            $per_page = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);

            $logs = ActivityLog::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->simplePaginate($per_page, ['*'], 'page', $page);

            return $this->successResponse($logs, 'Activity logs retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Server Error', 500, $e->getMessage());
        }
    }
}
