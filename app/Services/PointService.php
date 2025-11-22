<?php

namespace App\Services;

use App\Models\Point;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class PointService
{
    public function addPoints(string $userId, int $amount, string $description = null): bool
    {
        return DB::transaction(function () use ($userId, $amount, $description) {
            $point = Point::where('user_id', $userId)->first();
            if (!$point) {
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
                'description' => '+ ' . ($description ?: 'Points added') . ": {$amount} points",
                'data' => [
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter,
                ],
            ]);

            return true;
        });
    }

    public function subtractPoints(string $userId, int $amount, string $description = null, array $extraData = []): bool
    {
        return DB::transaction(function () use ($userId, $amount, $description, $extraData) {
            $point = Point::where('user_id', $userId)->first();
            if (!$point) {
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
                'description' => '- ' . ($description ?: 'Points subtracted') . ": {$amount} points",
                'data' => array_merge([
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter,
                ], $extraData),
            ]);

            return true;
        });
    }

    public function getBalance(string $userId): int
    {
        $point = Point::where('user_id', $userId)->first();
        return $point ? $point->balance : 0;
    }
}