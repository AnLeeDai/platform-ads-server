<?php

use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [App\Http\Controllers\AuthController::class, 'store']);
Route::post('/auth/login', [App\Http\Controllers\AuthController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    // Admin Routes
    Route::prefix('admin')->middleware(['role:admin'])->group(function () {
        Route::get('/roles', [App\Http\Controllers\RoleController::class, 'index']);

        Route::prefix('users')->group(function () {
            Route::get('/', [App\Http\Controllers\UserController::class, 'index']);
        });

        Route::prefix('storage')->group(function () {
            Route::get('/', [App\Http\Controllers\StorageController::class, 'index']);
            Route::post('/', [App\Http\Controllers\StorageController::class, 'store']);
            Route::put('/{id}', [App\Http\Controllers\StorageController::class, 'update']);
        });

        Route::prefix('wheels')->group(function () {
            Route::post('/', [App\Http\Controllers\WheelController::class, 'store']);
            Route::delete('/', [App\Http\Controllers\WheelController::class, 'deleteAll']);
            Route::post('/clear-cache', [App\Http\Controllers\WheelController::class, 'clearCache']);
        });

        Route::prefix('points')->group(function () {
            Route::post('/', [App\Http\Controllers\PointController::class, 'store']);
        });
    });

    // User Routes
    Route::get('/auth/me', [App\Http\Controllers\AuthController::class, 'me']);
    Route::post('/auth/logout', [App\Http\Controllers\AuthController::class, 'logout']);

    Route::prefix('points')->group(function () {
        Route::get('/', [App\Http\Controllers\PointController::class, 'index']);
        Route::get('/me', [App\Http\Controllers\PointController::class, 'myPoints']);
        Route::get('/transactions', [App\Http\Controllers\PointController::class, 'transactionHistory']);
    });

    Route::prefix('inventory')->group(function () {
        Route::get('/', [App\Http\Controllers\InventoryController::class, 'index']);
        Route::post('/inventory/{id}/use', [App\Http\Controllers\InventoryController::class, 'markAsUsed']);
    });

    Route::prefix('wheels')->group(function () {
        Route::get('/', [App\Http\Controllers\WheelController::class, 'index']);
        Route::post('/spin', [App\Http\Controllers\WheelController::class, 'startSpin']);
    });
});