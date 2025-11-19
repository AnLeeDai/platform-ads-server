<?php

namespace App\Http\Controllers;

use Carbon\Carbon;

abstract class Controller
{
    // sucess response
    protected function successResponse($data, $message = 'Success', $status = 200)
    {
        return response()->json([
            'status' => $status ?? 200,
            'message' => $message ?? 'Success',
            'time_stamp' => Carbon::now()->toDateTimeString(),
            'data' => $data ?? [],
        ], $status);
    }

    // error response
    protected function errorResponse($message = 'Error', $status = 400, $data = null)
    {
        return response()->json([
            'status' => $status ?? 400,
            'message' => $message ?? 'Error',
            'time_stamp' => Carbon::now()->toDateTimeString(),
            'data' => $data ?? [],
        ], $status);
    }
}
