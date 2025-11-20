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
});