<?php

namespace App\Http\Controllers;

use App\Models\Point;
use App\Services\PointService;
use App\Models\Transaction;
use App\Http\Requests\PointAddRequest;
use Illuminate\Http\Request;

class PointController extends Controller
{

    protected Point $pointModel;
    protected PointService $pointService;

    public function __construct(Point $pointModel, PointService $pointService)
    {
        $this->pointModel = $pointModel;
        $this->pointService = $pointService;
    }

    public function myPoints(Request $request)
    {
        try {
            $user = auth()->user();

            $point = $this->pointService->getPoint($user->id);

            if (!$point) {
                return response()->json([
                    'message' => 'Point record not found for this user',
                ], 404);
            }

            return response()->json([
                'message' => 'Point record retrieved successfully',
                'data' => $point
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching point record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        try {
            $per_page = 10;
            $page = 1;

            $points = $this->pointModel->simplePaginate(
                $per_page,
                ['*'],
                'page',
                $page
            );

            return response()->json([
                'message' => 'Points retrieved successfully',
                'data' => $points
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching points',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(PointAddRequest $request)
    {
        try {
            $user = auth()->user();

            // Check if user is admin
            if (!$user->role || $user->role['name'] !== 'admin') {
                return response()->json([
                    'message' => 'Unauthorized: Only admin can add points',
                ], 403);
            }

            $validated = $request->validated();

            $point = $this->pointService->addPoints(
                $validated['user_id'],
                $validated['amount'],
                'System added points'
            );

            return response()->json([
                'message' => 'Points added successfully',
                'data' => $point
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error adding points',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function transactionHistory(Request $request)
    {
        try {
            $user = auth()->user();

            $per_page = (int) $request->query('per_page', 10);
            $page = (int) $request->query('page', 1);

            $transactions = Transaction::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->simplePaginate($per_page, ['*'], 'page', $page)
                ->through(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'type' => $transaction->type,
                        'amount' => $transaction->amount,
                        'description' => $transaction->description,
                        'change_type' => $transaction->type === 'add' ? 'positive' : 'negative',
                        'data' => $transaction->data,
                        'created_at' => $transaction->created_at,
                        'updated_at' => $transaction->updated_at,
                    ];
                });

            return response()->json([
                'message' => 'Transaction history retrieved successfully',
                'data' => $transactions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching transaction history',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
