<?php

namespace App\Services;

use App\Models\Point;
use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PointService
{
    protected $cacheTtl = 3600; // 1 hour

    public function addPoints(string $userId, int $amount, ?string $description = null): Point
    {
        $point = DB::transaction(function () use ($userId, $amount, $description) {
            $point = Point::where('user_id', $userId)->lockForUpdate()->first();
            if (! $point) {
                throw new \Exception('Point record not found for user');
            }

            $balanceBefore = $point->balance;
            $point->balance += $amount;
            $point->save();
            $balanceAfter = $point->balance;

            Transaction::create([
                'user_id' => $userId,
                'type' => 'add',
                'amount' => $amount,
                'description' => '+ '.($description ?: 'Points added').": {$amount} points",
                'data' => [
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter,
                ],
            ]);

            return $point;
        });

        // Clear cache
        Cache::forget("user_points_{$userId}");

        return $point;
    }

    public function subtractPoints(string $userId, int $amount, ?string $description = null, array $extraData = []): Point
    {
        $point = DB::transaction(function () use ($userId, $amount, $description, $extraData) {
            $point = Point::where('user_id', $userId)->lockForUpdate()->first();
            if (! $point) {
                throw new \Exception('Point record not found for user');
            }

            if ($point->balance < $amount) {
                throw new \Exception('Insufficient points');
            }

            $balanceBefore = $point->balance;
            $point->balance -= $amount;
            $point->save();
            $balanceAfter = $point->balance;

            Transaction::create([
                'user_id' => $userId,
                'type' => 'subtract',
                'amount' => $amount,
                'description' => '- '.($description ?: 'Points subtracted').": {$amount} points",
                'data' => array_merge([
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter,
                ], $extraData),
            ]);

            return $point;
        });

        // Clear cache
        Cache::forget("user_points_{$userId}");

        return $point;
    }

    public function getPoint(string $userId): Point
    {
        return Cache::remember("user_points_{$userId}", $this->cacheTtl, function () use ($userId) {
            return Point::where('user_id', $userId)->first();
        });
    }

    public function getBalance(string $userId): int
    {
        $point = $this->getPoint($userId);

        return $point ? $point->balance : 0;
    }
}
