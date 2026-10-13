<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\QueueController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Bookings
        Route::apiResource('/bookings', BookingController::class);
        Route::patch('/bookings/{booking}/start', [BookingController::class, 'startWash']);
        Route::patch('/bookings/{booking}/finish', [BookingController::class, 'finishWash']);

        // Queue
        Route::get('/queue/live', [QueueController::class, 'live']);
        Route::post('/queue/call-next', [QueueController::class, 'callNext']);
        Route::get('/queue/stats', [QueueController::class, 'stats']);
    });
});
