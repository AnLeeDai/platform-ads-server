<?php

use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::get('/me', [App\Http\Controllers\AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::post('/register', [App\Http\Controllers\AuthController::class, 'store']);
    Route::post('/login', [App\Http\Controllers\AuthController::class, 'index']);
    Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
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
        Route::get('/', [App\Http\Controllers\WheelController::class, 'index']);
        Route::post('/', [App\Http\Controllers\WheelController::class, 'store']);
        Route::delete('/', [App\Http\Controllers\WheelController::class, 'deleteAll']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('wheels')->group(function () {
        Route::get('/', [App\Http\Controllers\WheelController::class, 'index']);
        Route::get('/spin', [App\Http\Controllers\WheelController::class, 'startSpin']);
    });
});