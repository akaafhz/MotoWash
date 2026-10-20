<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\QueueController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::get('/bookings', [BookingController::class, 'index'])
            ->middleware('role:customer,washer,admin');
        Route::post('/bookings', [BookingController::class, 'store'])
            ->middleware('role:customer');
        Route::get('/bookings/{booking}', [BookingController::class, 'show'])
            ->middleware('role:customer,washer,admin');
        Route::patch('/bookings/{booking}', [BookingController::class, 'update'])
            ->middleware('role:customer,admin');
        Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])
            ->middleware('role:customer,admin');
        Route::patch('/bookings/{booking}/start', [BookingController::class, 'startWash'])
            ->middleware('role:washer,admin');
        Route::patch('/bookings/{booking}/finish', [BookingController::class, 'finishWash'])
            ->middleware('role:washer,admin');

        Route::get('/queue/live', [QueueController::class, 'live'])
            ->middleware('role:customer,washer,admin');
        Route::post('/queue/call-next', [QueueController::class, 'callNext'])
            ->middleware('role:washer,admin');
        Route::post('/queue/{booking}/skip', [QueueController::class, 'skip'])
            ->middleware('role:washer,admin');
        Route::get('/queue/stats', [QueueController::class, 'stats'])
            ->middleware('role:washer,admin');
    });
});
